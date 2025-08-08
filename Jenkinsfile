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
    }
}
