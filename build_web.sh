mkdir -p  "./build/web/transformations"
mkdir -p  "./build/web/public"
cp "./transformations/transformation_1_20.js" "./build/web/transformations/transformation_1_20.js" -f
cp "./transformations/transformation_1_21_4.js" "./build/web/transformations/transformation_1_21_4.js" -f
cp "./NBTool.js" "./build/web/NBTool.js" -f
cp "./NBTParser.js" "./build/web/NBTParser.js" -f
cp "./mccommand.js" "./build/web/mccommand.js" -f
cp "./ErrorMessages.js" "./build/web/ErrorMessages.js" -f
cp "./package.json" "./build/web/package.json" -f
cp "./web/" "./build/" -f -r
cp "./tools/" "./build/web" -f -r
cp "./build/web/index.html" "./build/web/public/index.html" -f -r
cp "./favicon.ico" "./build/web/public/favicon.ico" -f -r
npx browserify "build/web/index.js" -o "build/web/public/index.js"