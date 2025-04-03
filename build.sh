# Get the latest changes
git pull

# Build the project
tsc --build --verbose

# Remove some old build files
rm -rf ./build/website/app
rm -rf ./build/sql/*

# Remake
mkdir ./build/website/app

# Copy new files
cp -rf ./src/sql/* ./build/sql/
cp -rf ./src/website/app/build ./build/website/app

# Done
echo "Done!"
