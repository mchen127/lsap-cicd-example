pipeline {
    agent any
    // ---- Global pipeline options ----
    options {
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '30'))
        timestamps()
        ansiColor('xterm')
    }

    parameters {
        // Optional: specify a fully qualified image (e.g. "yourid/cicd-workshop-app:5") to deploy/rollback on main
        string(
            name: 'IMAGE_TAG_OVERRIDE',
            defaultValue: '',
            description: 'Rollback/override: <user>/<repo>:<tag> (e.g., yourid/cicd-workshop-app:5)'
        )

        // Email recipients for notifications
        string(
            name: 'RECIPIENTS',
            defaultValue: 'mchen127.p@gmail.com, morris1297@ntu.im',
            description: 'Mail recipients on failure/success'
        )

        // Student identifier to include in notifications
        string(
            name: 'STUDENT_ID',
            defaultValue: 'r14725021',
            description: 'Your student ID for identification in the pipeline'
        )

        // Non-secret knobs
        string(
            name: 'DOCKER_REPO',
            defaultValue: 'cicd-workshop-app',
            description: 'Docker repo name (without username)'
        )
        string(
            name: 'STAGING_PORT',
            defaultValue: '8081',
            description: 'Staging port (host side)'
        )
        string(
            name: 'PROD_PORT',
            defaultValue: '8082',
            description: 'Production port (host side)'
        )
    }

    stages {
        // ---- Quality gate: run tests & lint in parallel ----
        stage('Quality') {
            parallel {
                stage('Test') {
                    options { timeout(time: 10, unit: 'MINUTES') }
                    steps {
                        retry(2) {
                            sh 'npm ci'
                            sh 'npm test'
                        }
                    }
                }
                stage('Lint') {
                    steps {
                        sh 'npm run lint'
                    }
                }
            }
        }

        // ---- Build + Push + Deploy to Staging (dev branch only) ----
        stage('Build, Push & Staging Deploy') {
            when { branch 'dev' }
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        // Image naming
                        string imageBase         = "${DOCKER_USER}/${params.DOCKER_REPO}"
                        string buildTag          = "${imageBase}:${env.BUILD_NUMBER}"
                        string candidateTag      = "${imageBase}:candidate-${env.BUILD_NUMBER}"

                        echo "Building image: ${buildTag}"
                        sh """
                            set -e
                            docker build --pull --no-cache -t "${buildTag}" .
                            docker tag "${buildTag}" "${candidateTag}"
                        """

                        echo '--- Logging in to Docker Hub ---'
                        sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'

                        echo '--- Pushing images to Docker Hub ---'
                        sh """
                            set -e
                            docker push "${buildTag}"
                            docker push "${candidateTag}"
                        """

                        // Staging deploy
                        echo '--- Deploying to STAGING ---'
                        sh """
                            docker stop staging-app || true
                            docker rm   staging-app || true
                            docker run -d --name staging-app -p ${params.STAGING_PORT}:3000 "${candidateTag}"
                        """

                        echo '--- Verifying STAGING health ---'
                        sh """
                            set +e
                            for i in {1..12}; do
                            if curl -fsS "http://localhost:${params.STAGING_PORT}/health" > /dev/null; then
                                echo "Health check passed"; exit 0;
                            fi
                            echo "Health check attempt \$i failed; retrying..."
                            sleep 5
                            done
                            echo "Health check failed after retries"
                            exit 1
                        """
                    }
                }
            }
        }

        // ---- Production Deployment (main branch only) ----
        stage('Deploy to Production') {
            when { branch 'main' }
            steps {
                script {
                    // choose image: parameter override or prompt operator
                    string imageToDeploy = params.IMAGE_TAG_OVERRIDE?.trim()

                    if (!imageToDeploy) {
                        // Ask for the exact image to deploy (no brittle cross-job lookups)
                        string inputValues = input(
                            message: 'Enter Docker image to deploy to PRODUCTION (format: <user>/<repo>:<tag>)',
                            ok: 'Deploy',
                            parameters: [
                                string(
                                    defaultValue: '',
                                    name: 'IMAGE_TAG',
                                    description: 'e.g., yourid/cicd-workshop-app:candidate-123'
                                )
                            ]
                        )
                        imageToDeploy = inputValues['IMAGE_TAG']?.trim()
                    }

                    // Basic validation
                    if (!imageToDeploy || !imageToDeploy.contains('/') || !imageToDeploy.contains(':')) {
                        error "IMAGE_TAG must look like '<user>/<repo>:<tag>', got: '${imageToDeploy}'"
                    }

                    // Manual approval gate with timeout & submitter control (optional: adjust submitter)
                    timeout(time: 15, unit: 'MINUTES') {
                        input message: "Deploy image '${imageToDeploy}' to PRODUCTION?", submitter: 'ops,teachers'
                    }

                    withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
                                                    usernameVariable: 'DOCKER_USER',
                                                    passwordVariable: 'DOCKER_PASS')]) {
                        sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                    }

                    echo "--- Pulling and deploying PRODUCTION image: ${imageToDeploy} ---"
                    sh """
                    set -e
                    docker pull "${imageToDeploy}"
                    docker stop prod-app || true
                    docker rm   prod-app || true
                    docker run -d --name prod-app -p ${params.PROD_PORT}:3000 "${imageToDeploy}"
                    """

                    echo '--- Verifying PRODUCTION health ---'
                    sh """
                    set +e
                    for i in {1..12}; do
                        if curl -fsS "http://localhost:${params.PROD_PORT}/health" > /dev/null; then
                        echo "Health check passed"; exit 0;
                        fi
                        echo "Health check attempt \$i failed; retrying..."
                        sleep 5
                    done
                    echo "Health check failed after retries"
                    exit 1
                    """

                    // Record which image was deployed (appears in console log + can be scraped if needed)
                    echo "PRODUCTION_DEPLOY_IMAGE=${imageToDeploy}"
                    currentBuild.description = "Deployed ${imageToDeploy} to PRODUCTION"
                }
            }
        }
    }

    post {
        always {
            // Publish test results if you have them (adjust glob to your runner)
            // junit 'reports/junit/**/*.xml'  // Uncomment & set path if available

            // Logout & cleanup
            sh 'docker logout || true'
            cleanWs()
        }

        failure {
            echo '--- Build Failed. Sending Notification. ---'
            mail to: params.RECIPIENTS,
                subject: "Build FAILED by ${params.STUDENT_ID}: ${currentBuild.fullDisplayName}",
                body: "A problem occurred in the '${env.STAGE_NAME}' stage. Check the build log at ${env.BUILD_URL}"
        }

        success {
            mail to: params.RECIPIENTS,
                subject: "Build SUCCESS by ${params.STUDENT_ID}: ${currentBuild.fullDisplayName}",
                body: "Build succeeded. Logs: ${env.BUILD_URL}"
        }
    }
}
