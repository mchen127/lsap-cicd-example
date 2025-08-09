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

        // --- NEW STAGE ---
        // This stage runs our linter to check for code quality.
        // It will run on ALL branches that have this Jenkinsfile.
        stage('Static Analysis (Lint)') {
            steps {
                echo '--- Running Linter ---'
                sh 'npm run lint'
            }
        }

        // --- NEW STAGE ---
        // This stage builds the Docker image.
        // It will run on ALL branches that have this Jenkinsfile.
        stage('Deploy and Verify') {
            when {
                branch 'dev'
            }
            steps {
                script {
                    def dockerhubUser = 'mchen127'
                    // Define two tags: one with the build number for history, one for 'latest-dev'
                    def versionedImage = "${dockerhubUser}/cicd-workshop-app:${env.BUILD_NUMBER}"
                    def latestDevImage = "${dockerhubUser}/cicd-workshop-app:latest-dev"

                    echo "Building image: ${versionedImage}"
                    sh "docker build -t ${versionedImage} ."
                    
                    // Also tag the same image as 'latest-dev'
                    sh "docker tag ${versionedImage} ${latestDevImage}"

                    withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        echo '--- Logging in to Docker Hub ---'
                        sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"

                        echo "--- Pushing ${versionedImage} ---"
                        sh "docker push ${versionedImage}"
                        
                        echo "--- Pushing ${latestDevImage} ---"
                        sh "docker push ${latestDevImage}"
                    }

                    // Deploy the versioned image to staging
                    sh 'docker stop staging-app || true'
                    sh 'docker rm staging-app || true'
                    sh "docker run -d --name staging-app -p 8081:3000 ${versionedImage}"
                    sleep(5)
                    sh 'curl -f http://localhost:8081/health'
                }
            }
        }

        // --- NEW STAGE ---
        // This stage deploys the application to production.
        // It will only run when the branch is 'main'.
        // It also allows for rollbacks by specifying an image tag.    
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    def dockerhubUser = 'mchen127'
                    def imageToDeploy

                    if (params.IMAGE_TAG_OVERRIDE.trim()) {
                        // For rollbacks, use the specified tag
                        imageToDeploy = params.IMAGE_TAG_OVERRIDE
                        echo "--- ROLLBACK INITIATED: Deploying specified image: ${imageToDeploy} ---"
                    } else {
                        // For standard deployments, always use the 'latest-dev' tag
                        imageToDeploy = "${dockerhubUser}/cicd-workshop-app:latest-dev"
                        echo "--- STANDARD DEPLOYMENT: Deploying latest dev image: ${imageToDeploy} ---"
                    }
                    
                    input "Deploy image '${imageToDeploy}' to PRODUCTION?"

                    withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                    }

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

    // --- NEW SECTION ---
    // This 'post' block runs after all stages are complete.
    // It defines actions based on the final status of the pipeline.
    post {
        // This 'failure' block only runs if any stage in the pipeline has failed.
        failure {
            echo '--- Build Failed. Sending Notification. ---'
            mail to: params.RECIPIENTS,
                 subject: "Build FAILED by r14725021: ${currentBuild.fullDisplayName}",
                 body: "A problem occurred in the '${env.STAGE_NAME}' stage. Check the build log at ${env.BUILD_URL}"
        }
    }
}
