# Install Node.js Version Manager ([nvm](https://github.com/nvm-sh)).

cd $HOME
git clone https://github.com/nvm-sh/nvm.git .nvm

# Source new files (done automatically if login again)
. $HOME/.nvm/nvm.sh

# Install and activate
nvm install v12.13.1    # Install stable version of node
nvm install-latest-npm  # Install latest npm for node version
nvm use node            # Activate node version
npm install jsdoc       # Install jsdoc
