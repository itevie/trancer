git pull
rm -rf build/
tsc --build --verbose
cp -r ./src/sql ./build/sql
cp -r ./src/data ./build/data
mkdir ./build/website/app
cp -r ./src/website/app/build ./build/website/app