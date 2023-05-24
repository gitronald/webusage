# Make jsdoc documentation

config="conf.json"
echo -e "Making JSDocs using: "$config
python -m json.tool $config  # Print config

# Make docs
node_modules/jsdoc/jsdoc.js -c $config