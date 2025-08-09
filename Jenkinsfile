pipeline {
    agent any

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
                    String imageName = "staging-app:${env.BUILD_NUMBER}"
                    echo "Building image: ${imageName}"
                    sh "docker build -t ${imageName} ."

                    sh 'docker stop staging-app || true'
                    sh 'docker rm staging-app || true'

                    echo 'Deploying container...'
                    sh "docker run -d --name staging-app -p 8081:3000 ${imageName}"

                    echo 'Verifying deployment...'
                    sleep(5)
                    sh 'curl -f http://localhost:8081/health'
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
            mail to: 'mchen127.p@gamil.com, morris1297@ntu.im',
                 subject: "Build FAILED by r14725021: ${currentBuild.fullDisplayName}",
                 body: "A problem occurred in the '${env.STAGE_NAME}' stage. Check the build log at ${env.BUILD_URL}"
        }
    }
}
