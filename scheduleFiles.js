const fsBasic = require('fs');
const fs = require('fs/promises');
const path = require('path');

if(process.env.OS.indexOf('Windows')!=-1){
    let profile = process.env.USERPROFILE;
    var basepath = profile+'\\Downloads';
    var destpath = profile+'\\Documenti';
}else{
    console.error('Versione disponibile solo per Windows')
    process.exit()
}

async function main(){
    const files = await fs.readdir(basepath)
    
    files.forEach(async function(file){
        let data = await fs.stat(basepath+'\\'+file) 
        hadlingFile(file, data)      
    })
}

async function hadlingFile(file, dataFile){
    
    const ext = path.extname(file);
    const basename = path.basename(file, ext);
    
    switch(ext){
        case '.ini': 
            deleteFile(file);
            break;
        default:
            let timestamp = JSON.stringify(dataFile.ctime).split('T')[0].replaceAll('"', '').split('-');
            let extname = ext.replace('.', '');
            const formatName =  destpath+'\\'+extname+'\\'+basename.replaceAll(' ', '')+'_'+timestamp[2]+''+timestamp[1]+''+timestamp[0]+''+ext;
            if(!fsBasic.existsSync(destpath+'\\'+extname)){
                try{
                    await fs.mkdir(destpath+'\\'+extname)
                    moveFile(file, formatName);
                }catch(e){
                    process.exit()
                }
            }else{
                if(!fsBasic.existsSync(formatName))
                    moveFile(file, formatName)
                else{
                    if(dataFile.isFile()){
                        deleteFile(file)
                    }else{
                        let dir = await fs.opendir(basepath+'\\'+file)
                        let dirFiles = dir.readSync(); 
                        
                        while(dirFiles!=null){
                            if(!fsBasic.existsSync(formatName+'\\'+dirFiles.name)){
                                await fs.rename(dirFiles.path, formatName+'\\'+dirFiles.name)
                            }else{
                                await fs.unlink(dirFiles.path)
                            }
                            dirFiles = dir.readSync();
                        }
                        dir.closeSync();

                        fs.rmdir(basepath+'\\'+file);
                    }
                }
            }            
    }

}
function moveFile(f, dest){
    return fs.rename(basepath+'\\'+f, dest)
}
function deleteFile(f){
    return fs.unlink(basepath+'\\'+f)
}

try{
    console.time()
    main();
    console.timeEnd()
}catch(e){
    console.log(e)
    process.exit()
}
