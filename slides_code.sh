sudo usermod -aG docker jenkins
sudo usermod -aG docker $USER

sudo systemctl restart jenkins
newgrp docker
