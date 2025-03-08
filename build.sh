git pull
tsc --build --verbose
cp -r ./src/sql ./build/sql
rm -rf ./build/website/app
mkdir ./build/website/app
cp -r ./src/website/app/build ./build/website/app
cp -r ./src/sql ./build/sql