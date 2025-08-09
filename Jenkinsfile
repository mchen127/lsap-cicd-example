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

        // --- MODIFIED STAGE ---
        // This stage now has a 'when' condition. It will be SKIPPED
        // on any branch that is NOT the 'dev' branch.
        stage('Deploy and Verify') {
            when {
                branch 'dev'
            }
            steps {
                script {
                    // Define your Docker Hub username and image name
                    String dockerhubUser = 'mchen127'
                    String imageName = "${dockerhubUser}/cicd-workshop-app:${env.BUILD_NUMBER}"

                    echo "Building image: ${imageName}"
                    sh "docker build -t ${imageName} ."

                    // --- NEW SECTION: PUSH TO DOCKER HUB ---
                    // Use the 'dockerhub-creds' ID we created in Jenkins
                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        echo '--- Logging in to Docker Hub ---'
                        sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"

                        echo '--- Pushing image to Docker Hub ---'
                        sh "docker push ${imageName}"
                    }
                    // --- END NEW SECTION ---

                    // The rest of the staging deployment remains the same
                    sh 'docker stop staging-app || true'
                    sh 'docker rm staging-app || true'
                    echo 'Deploying container to staging...'
                    sh "docker run -d --name staging-app -p 8081:3000 ${imageName}"
                    echo 'Verifying staging deployment...'
                    sleep(5)
                    sh 'curl -f http://localhost:8081/health'
                }
            }
        }
        // --- NEW: PRODUCTION DEPLOYMENT STAGE ---
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    def dockerhubUser = 'mchen127' // <-- Make sure this is correct
                    def imageToDeploy

                    if (params.IMAGE_TAG_OVERRIDE.trim()) {
                        imageToDeploy = params.IMAGE_TAG_OVERRIDE
                        echo "--- ROLLBACK INITIATED: Deploying specified image: ${imageToDeploy} ---"
                    } else {
                        // --- THIS IS THE FIXED LINE ---
                        def latestDevBuildNumber = currentBuild.rawBuild.getProject().getParent().getItem('dev').getLastSuccessfulBuild().getNumber()
                        imageToDeploy = "${dockerhubUser}/cicd-workshop-app:${latestDevBuildNumber}"
                        echo "--- STANDARD DEPLOYMENT: Deploying latest dev image: ${imageToDeploy} ---"
                    }
                    
                    input "Deploy image '${imageToDeploy}' to PRODUCTION?"

                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
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
