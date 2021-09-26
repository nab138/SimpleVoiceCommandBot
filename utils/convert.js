const ffmpeg = require('fluent-ffmpeg');
module.exports = convert
/**
 *    input - string, path of input file
 *    output - string, path of output file
 *    callback - function, node-style callback fn (error, result)        
 */
function convert(input, output, callback) {
    ffmpeg(input)
        .inputOptions('-c:a libopus')
        .outputOptions('-ac 1')
        .output(output)
        .on('end', function() {                    
            callback(null);
        }).on('error', function(err){
            console.log('error: ', err.code, err.msg);
            callback(err);
        }).run();
}
