pipeline {
    agent any // Run on any available Jenkins agent

    stages {
        stage('Build & Test') {
            steps {
                echo "--- Running Build & Test on branch ${env.BRANCH_NAME} ---"
                sh 'npm install'
                sh 'npm test'
            }
        }
        stage('Deploy and Verify') {
            steps {
                script {
                    // Build a Docker image and tag it with the build number
                    String imageName = "staging-app:${env.BUILD_NUMBER}"
                    echo "Building image: ${imageName}"
                    sh "docker build -t ${imageName} ."

                    // Stop and remove any old container
                    sh 'docker stop staging-app || true'
                    sh 'docker rm staging-app || true'

                    // Run the new container, mapping port 8081 inside the VM
                    echo 'Deploying container...'
                    sh "docker run -d --name staging-app -p 8081:3000 ${imageName}"

                    // Verify the deployment
                    echo 'Verifying deployment...'
                    sleep(time: 5, unit: 'SECONDS') // Wait for the app to start
                    sh 'curl -f http://localhost:8081/health'
                }
            }
        }
    }
}
