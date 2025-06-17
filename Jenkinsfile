pipeline {
    agent any
    
    environment {
        NODE_VERSION = '20'
        DOCKER_IMAGE = 'lawhelp-app'
        DOCKER_TAG = "${BUILD_NUMBER}"
        REGISTRY = 'localhost:5000'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    sh '''
                        node --version
                        npm --version
                        npm ci
                    '''
                }
            }
        }
        
        stage('Lint') {
            steps {
                sh 'npm run lint || true'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
                publishTestResults testResultsPattern: 'test-results.xml'
                publishCoverageReport sourceFileResolver: sourceFiles('NEVER_STORE'), coverageFiles: 'coverage/lcov.info'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Security Scan') {
            steps {
                sh 'npm audit --audit-level=moderate'
            }
        }
        
        stage('Docker Build') {
            steps {
                script {
                    sh '''
                        docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                        docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest
                    '''
                }
            }
        }
        
        stage('Integration Tests') {
            steps {
                script {
                    sh '''
                        docker-compose -f docker-compose.test.yml up -d
                        npm run test:integration
                        docker-compose -f docker-compose.test.yml down
                    '''
                }
            }
        }
        
        stage('Push to Registry') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    sh '''
                        docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}
                        docker push ${REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}
                        
                        if [ "${BRANCH_NAME}" = "main" ]; then
                            docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${REGISTRY}/${DOCKER_IMAGE}:stable
                            docker push ${REGISTRY}/${DOCKER_IMAGE}:stable
                        fi
                    '''
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    sh '''
                        kubectl config use-context staging
                        helm upgrade --install lawhelp-staging ./k8s/helm-chart \
                            --set image.tag=${DOCKER_TAG} \
                            --set environment=staging \
                            --namespace staging
                    '''
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    input message: 'Deploy to Production?', ok: 'Deploy'
                    sh '''
                        kubectl config use-context production
                        helm upgrade --install lawhelp-prod ./k8s/helm-chart \
                            --set image.tag=${DOCKER_TAG} \
                            --set environment=production \
                            --namespace production
                    '''
                }
            }
        }
        
        stage('Post-Deploy Tests') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    sh 'npm run test:e2e'
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
            slackSend(
                channel: '#deployments',
                color: 'good',
                message: "✅ ${env.JOB_NAME} - Build #${env.BUILD_NUMBER} succeeded (<${env.BUILD_URL}|Open>)"
            )
        }
        failure {
            echo 'Pipeline failed!'
            slackSend(
                channel: '#deployments',
                color: 'danger',
                message: "❌ ${env.JOB_NAME} - Build #${env.BUILD_NUMBER} failed (<${env.BUILD_URL}|Open>)"
            )
        }
    }
}