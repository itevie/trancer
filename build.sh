git pull
tsc --build --verbose
cp -r ./src/sql ./build/sql
mkdir ./build/website/app
rm -rf ./build/website/app
cp -r ./src/website/app/build ./build/website/app