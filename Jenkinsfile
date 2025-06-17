pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'lawhelp'
        DOCKER_TAG = "${BUILD_NUMBER}"
        KUBECONFIG = credentials('kubeconfig')
        DOCKER_REGISTRY = 'your-registry.com'
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
                    sh 'npm ci'
                }
            }
        }
        
        stage('Lint and Type Check') {
            steps {
                script {
                    echo "Running ESLint and TypeScript checks"
                    sh 'npm run check'
                }
            }
        }
        
        stage('Unit Tests') {
            steps {
                script {
                    echo "Running unit tests with coverage"
                    sh 'npm test -- --coverage --watchAll=false'
                }
                publishTestResults(
                    testResultsPattern: 'coverage/lcov.info',
                    allowEmptyResults: false
                )
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }
        
        stage('Integration Tests') {
            steps {
                script {
                    echo "Running integration tests"
                    sh 'npm run test:integration'
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    echo "Running security vulnerability scan"
                    sh 'npm audit --audit-level=moderate'
                }
            }
        }
        
        stage('Build Application') {
            steps {
                script {
                    echo "Building production application"
                    sh 'npm run build'
                }
            }
        }
        
        stage('Build Docker Image') {
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
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    echo "Deploying to staging environment"
                    sh """
                        kubectl set image deployment/lawhelp-app lawhelp=${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG} -n lawhelp-staging
                        kubectl rollout status deployment/lawhelp-app -n lawhelp-staging
                    """
                }
            }
        }
        
        stage('End-to-End Tests') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    echo "Running E2E tests against staging"
                    sh 'npm run test:e2e'
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "Deploying to production environment"
                    sh """
                        kubectl set image deployment/lawhelp-app lawhelp=${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG} -n lawhelp
                        kubectl rollout status deployment/lawhelp-app -n lawhelp
                    """
                }
            }
        }
        
        stage('Post-Deploy Verification') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    echo "Running post-deployment health checks"
                    sh 'npm run test:health'
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo "Pipeline completed successfully!"
            slackSend(
                channel: '#deployments',
                color: 'good',
                message: "✅ LawHelp deployment successful - Build ${BUILD_NUMBER}"
            )
        }
        failure {
            echo "Pipeline failed!"
            slackSend(
                channel: '#deployments',
                color: 'danger',
                message: "❌ LawHelp deployment failed - Build ${BUILD_NUMBER}"
            )
        }
    }
}