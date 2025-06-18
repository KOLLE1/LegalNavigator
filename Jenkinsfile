pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'lawhelp'
        DOCKER_TAG = "${BUILD_NUMBER}"
        // KUBECONFIG = credentials('kubeconfig')
        DOCKER_REGISTRY = 'ghcr.io'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Checked out source code from repository"
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    echo "Installing Node.js dependencies"
                    // Check if running on Windows or Unix
                    if (isUnix()) {
                        sh 'npm ci'
                    } else {
                        bat 'npm ci'
                    }
                }
            }
        }
        
        stage('Lint and Type Check') {
            steps {
                script {
                    echo "Running ESLint and TypeScript checks"
                    if (isUnix()) {
                        sh 'npm run check'
                    } else {
                        bat 'npm run check'
                    }
                }
            }
        }
        
        stage('Unit Tests') {
            steps {
                script {
                    echo "Running unit tests with coverage"
                    if (isUnix()) {
                        sh 'npm test -- --coverage --watchAll=false'
                    } else {
                        bat 'npm test -- --coverage --watchAll=false'
                    }
                }
                // Fix: Use proper test results publisher
                // publishTestResults(
                //     testResultsPattern: 'coverage/lcov.info',
                //     allowEmptyResults: false
                // )
            }
            post {
                always {
                    // Publish test results if available
                    script {
                        if (fileExists('coverage/lcov.info')) {
                            echo "Test coverage results found"
                        }
                    }
                }
            }
        }
        
        stage('Integration Tests') {
            steps {
                script {
                    echo "Running integration tests"
                    if (isUnix()) {
                        sh 'npm run test:integration'
                    } else {
                        bat 'npm run test:integration'
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    echo "Running security vulnerability scan"
                    if (isUnix()) {
                        sh 'npm audit --audit-level=moderate'
                    } else {
                        bat 'npm audit --audit-level=moderate'
                    }
                }
            }
        }
        
        stage('Build Application') {
            steps {
                script {
                    echo "Building production application"
                    if (isUnix()) {
                        sh 'npm run build'
                    } else {
                        bat 'npm run build'
                    }
                }
            }
        }
        
        stage('Build Docker Image') {
            when {
                // Only build Docker image on Unix systems (Linux/Mac)
                expression { isUnix() }
            }
            steps {
                script {
                    echo "Building Docker image"
                    def image = docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }
        
        // Commented stages remain the same...
        // stage('Deploy to Staging') {
        //     when {
        //         branch 'develop'
        //     }
        //     steps {
        //         script {
        //             echo "Deploying to staging environment"
        //             sh """
        //                 kubectl set image deployment/lawhelp-app lawhelp=${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG} -n lawhelp-staging
        //                 kubectl rollout status deployment/lawhelp-app -n lawhelp-staging
        //             """
        //         }
        //     }
        // }
    }
    
    post {
        always {
            script {
                // Run cleanup within node context
                echo "Cleaning up workspace"
                cleanWs()
            }
        }
        success {
            echo "Pipeline completed successfully!"
            // slackSend(
            //     channel: '#deployments',
            //     color: 'good',
            //     message: "✅ LawHelp deployment successful - Build ${BUILD_NUMBER}"
            // )
        }
        failure {
            echo "Pipeline failed!"
            // slackSend(
            //     channel: '#deployments',
            //     color: 'danger',
            //     message: "❌ LawHelp deployment failed - Build ${BUILD_NUMBER}"
            // )
        }
    }
}
