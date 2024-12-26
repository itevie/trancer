rm -rf build/
tsc --build --verbose
cp -r ./src/sql ./build/sql
cp -r ./src/data ./build/data