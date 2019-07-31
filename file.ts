
import * as fs from 'fs';
import * as ini from 'ini';

export class FileService {

    private dirPath: string;
    private basePath: string;

    constructor(dirPath , basePath){
        this.dirPath = dirPath;
        this.basePath = basePath;
    }

    readIniFile(database: string, key: string, defaultValue: string): Promise<string>{
        return new Promise(resolve =>{
            this.fileExistence().then((res: string) =>{
                if(res != null){
                    var config = ini.parse(fs.readFileSync(res, 'utf-8'));
                    if(config[database] && config[database][key]){
                        resolve(config[database][key]);
                    }else{
                        resolve(defaultValue);
                    }
                }else{
                    resolve('该文件路径不存在'); 
                }
            });
        })
    }

    wirteIniFile(database: string , dataArr :[ { key: string , value: string }]): Promise<string>{
        return new Promise(resolve =>{
            this.fileExistence().then((res: string) =>{
                let config: any[] = [];
                let pathFile: string;
                //文件不存在时,则不需要读文件
                if(res !=null){  
                    pathFile = res;
                     config = ini.parse(fs.readFileSync(pathFile, 'utf-8'));
                }else{
                    config[database] = {}
                    pathFile = this.dirPath
                }
                dataArr.forEach(dataArr_v => {
                    const key = dataArr_v.key;
                    const value = dataArr_v.value;
                    config[database][key] =value
                });
                fs.writeFile(pathFile, ini.stringify(config),(err)=>{ if(err) console.log(err)});
                resolve('写入完成');
            });
        });
    }

    //判断系统是否有这个文件
    private fileExistence(): Promise<string>{
        return new Promise((resolve) => {
            console.log(this.dirPath)
            fs.exists(this.dirPath , (dirExists: boolean) =>{
                if(dirExists){ 
                    if(dirExists) resolve(this.dirPath)
                }else{
                    fs.exists(this.basePath , (baseExists : boolean) => {
                        resolve(baseExists ? this.basePath : null)
                    });
                }
            });
        });
    }
    
}
