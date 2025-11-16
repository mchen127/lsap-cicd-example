pipeline {
    agent any

    parameters {
        string(
            name: 'IMAGE_TAG_OVERRIDE',
            defaultValue: '',
            description: 'To roll back, enter a specific Docker Hub image tag (e.g., your-id/app:5) and run manually.'
        )
        string(
            name: 'RECIPIENTS',
            defaultValue: 'mchen127.p@gmail.com, morris1297@ntu.im',
            description: 'Mail recipients on failure'
        )
    }

    stages {
        stage('Build & Test') {
            steps {
                echo '--- Running Build & Test ---'
                sh 'npm install'
                sh 'npm test'
            }
        }

        stage('Static Analysis (Lint)') {
            steps {
                echo '--- Running Linter ---'
                sh 'npm run lint'
            }
        }

        stage('Build, Push, and Deploy to Staging') {
            when {
                branch 'dev'
            }
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        def dockerhubUser = DOCKER_USER
                        def versionedImage = "${dockerhubUser}/cicd-workshop-app:dev-${env.BUILD_NUMBER}"
                        def latestDevImage = "${dockerhubUser}/cicd-workshop-app:latest-dev"

                        echo "Building dev image: ${versionedImage}"
                        sh "docker build -t ${versionedImage} ."
                        sh "docker tag ${versionedImage} ${latestDevImage}"

                        echo '--- Logging in to Docker Hub (dev) ---'
                        sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"

                        echo "--- Pushing ${versionedImage} ---"
                        sh "docker push ${versionedImage}"

                        echo "--- Pushing ${latestDevImage} ---"
                        sh "docker push ${latestDevImage}"

                        echo '--- Deploying to STAGING from dev image ---'
                        sh 'docker stop staging-app || true'
                        sh 'docker rm staging-app || true'
                        sh "docker run -d --name staging-app -p 8081:3000 ${versionedImage}"
                        sleep(5)
                        sh 'curl -f http://localhost:8081/health'
                    }
                }
            }
        }

        stage('Build and Push Production Image') {
            when {
                branch 'main'
            }
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        def dockerhubUser = DOCKER_USER
                        def prodVersionedImage = "${dockerhubUser}/cicd-workshop-app:main-${env.BUILD_NUMBER}"
                        def latestMainImage = "${dockerhubUser}/cicd-workshop-app:latest-main"

                        echo "Building production image: ${prodVersionedImage}"
                        sh "docker build -t ${prodVersionedImage} ."
                        sh "docker tag ${prodVersionedImage} ${latestMainImage}"

                        echo '--- Logging in to Docker Hub (main) ---'
                        sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"

                        echo "--- Pushing ${prodVersionedImage} ---"
                        sh "docker push ${prodVersionedImage}"

                        echo "--- Pushing ${latestMainImage} ---"
                        sh "docker push ${latestMainImage}"
                    }
                }
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        def dockerhubUser = DOCKER_USER
                        def imageToDeploy

                        if (params.IMAGE_TAG_OVERRIDE.trim()) {
                            imageToDeploy = params.IMAGE_TAG_OVERRIDE
                            echo "--- ROLLBACK INITIATED: Deploying specified image: ${imageToDeploy} ---"
                        } else {
                            imageToDeploy = "${dockerhubUser}/cicd-workshop-app:latest-main"
                            echo "--- STANDARD DEPLOYMENT: Deploying latest MAIN image: ${imageToDeploy} ---"
                        }

                        input "Deploy image '${imageToDeploy}' to PRODUCTION?"

                        echo '--- Logging in to Docker Hub (deploy) ---'
                        sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"

                        echo '--- Pulling production image from Docker Hub ---'
                        sh "docker pull ${imageToDeploy}"

                        sh 'docker stop prod-app || true'
                        sh 'docker rm prod-app || true'

                        echo 'Deploying container to production...'
                        sh "docker run -d --name prod-app -p 8082:3000 ${imageToDeploy}"
                    }
                }
            }
        }
    }

    post {
        failure {
            echo '--- Build Failed. Sending Notification. ---'
            mail to: params.RECIPIENTS,
                 subject: "Build FAILED by r14725021: ${currentBuild.fullDisplayName}",
                 body: "A problem occurred in the '${env.STAGE_NAME}' stage. Check the build log at ${env.BUILD_URL}"
        }
    }
}
