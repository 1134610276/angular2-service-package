class connectParams {
    host?: string
    port?: number
    secure?: boolean
    user?: string
    password?: string
    connTimeout?: number
    pasvTimeout?: number
    keepalive?: number
}

class dirListParams {
    date: Date
    name: string
    size: number
    type: string
}

// @Injectable()
export class FtpService {

    private ftpClient: any;
    private fs: any;
    private path: any;

    constructor() {
        const Client = require('ftp');
        this.ftpClient = new Client();
        this.fs = require('fs');
        this.path = require('path');
    }

    //获取全部文件列表
    getDirList(params: connectParams, path: string): Promise<dirListParams> {
        const Client = require('ftp');
        this.ftpClient = new Client();
        return new Promise(resolve => {
            this.ftpClient.on('ready', () => {
                this.ftpClient.list(path, (err, list: any) => {
                    if (err) throw err;
                    list.map((item: dirListParams) => {
                        item.name = Buffer.from(item.name, 'binary').toString('utf8')
                    })
                    resolve(list);
                    this.ftpClient.end();
                });
            });
            this.ftpClient.connect(params);
        })
    }

    //下载文件
    downDir(downFilePath: string, saveFilePath: string, saveFileName: string, params: connectParams): Promise<string> {
        const Client = require('ftp');
        this.ftpClient = new Client();
        return new Promise(resolve => {
        this.ftpClient.on('ready', () =>{
            this.fileExists(this.path.join(saveFilePath, saveFileName)).then((existsTag: boolean) => {
                if(existsTag) {
                    this.ftpClient.get(downFilePath, (err, stream) =>{
                        if (err) throw err;
                        stream.once('close', () =>{ this.ftpClient.end(); });
                        stream.pipe(this.fs.createWriteStream(this.path.join(saveFilePath,saveFileName)));
                    })
                    resolve('下载成功')
                }else{
                    resolve('下载失败')
                }
            })
        });
        this.ftpClient.connect(params);
        })
    }

    //上传文件
    putDir(savePath: string, upLoadPath: string, params: connectParams): Promise<string> {
        const Client = require('ftp');
        this.ftpClient = new Client();
        return new Promise(resolve => {
            console.log(savePath,upLoadPath)
            this.ftpClient.on('ready', () => {
                this.ftpClient.put(this.path.join(upLoadPath), this.path.join(savePath), (err) => {
                    if (err) {
                        console.log(err)
                        resolve('上传失败');
                        return;
                    }
                    this.ftpClient.end();
                    resolve('上传成功');
                });
            });
            this.ftpClient.connect(params);
        })
    }




    //获取文件夹 
    getAllDir(downFilePath: string, saveFilePath: string, params: connectParams): Promise<string> {
        let downFileName = downFilePath.lastIndexOf('/') ==-1 ?downFilePath : downFilePath.substring(downFilePath.lastIndexOf('/')+1);
        const Client = require('ftp');
        this.ftpClient = new Client();
        return new Promise(resolve => {
            this.getDirList(params, downFilePath).then((res: any) => {
                this.fileExists(this.path.join(saveFilePath,downFileName)).then((existsTag: boolean) => {
                    if (existsTag) {
                        this.fileMkdir(this.path.join(saveFilePath,downFileName)).then(fileMkdirTag => {
                            if (fileMkdirTag) {
                                res.forEach(element => { 
                                    this.downDir(this.path.join(downFilePath, element.name), this.path.join(saveFilePath, downFileName), element.name, params).then(res=>{
                                    })
                                })
                                resolve('获取文件夹成功')
                            } else {
                                resolve('创建目录失败')
                            }
                        })
                    }else{
                        resolve('本地存在该目录')
                    }
                });
            });
        })
    }

    //上传文件夹   
    putAllDir(savePath: string, upLoadPath: string, params: connectParams): Promise<string> {
        const Client = require('ftp');
        this.ftpClient = new Client();
        return new Promise(resolve => {
            this.mkdirDir(savePath, params).then(res => {
                if (res) {
                    let fileList = this.fs.readdirSync(upLoadPath);
                    let putDirBoolean: string;
                    fileList.forEach(fileList_v => {
                        this.putDir(this.path.join(savePath, fileList_v), this.path.join(upLoadPath, fileList_v), params).then((putDirTag: string) => {
                            if (!putDirTag) putDirBoolean = putDirTag
                        })
                    });
                    resolve(putDirBoolean)
                }else{
                    resolve('创建目录失败')
                }
            });
        });
    }

    //判断本地是否存在这个路径
    fileExists(filePath: string): Promise<boolean> {
        return new Promise(resolve => {
            this.fs.exists(filePath, (err) => {
                resolve(err ? false : true);
                if (err) throw err;
            })
        })
    }

    //本地创建目录
    fileMkdir(filePath: string): Promise<boolean> {
        return new Promise(resolve => {
            this.fs.mkdir(filePath, (err) => {
                resolve(err ? false : true);
                if (err) throw err;
            })
        })
    }
    //删除ftp服务器上文件
    deleteDir(deletePath: string, params: connectParams): Promise<boolean> {
        const Client = require('ftp');
        this.ftpClient = new Client();
        return new Promise(resolve => {
            this.ftpClient.on('ready' ,() => {
                this.ftpClient.rmdir(deletePath ,(err) => {
                    resolve(err ? true : false);
                    this.ftpClient.end();
                    if (err) throw err;
                });
            });
            this.ftpClient.connect(params);
        });
    }

    //新建ftp服务器上目录
    mkdirDir(mkdirPath: string, params: connectParams): Promise<boolean> {
        const Client = require('ftp');
        this.ftpClient = new Client();
        return new Promise(resolve => {
            this.ftpClient.on('ready' ,() => {
                this.ftpClient.mkdir(mkdirPath ,(err) => {
                    resolve(err ? false : true);
                    this.ftpClient.end();
                    if (err) throw err;
                });
            });
            this.ftpClient.connect(params);
        });
    }

    //删除ftp服务器上目录
    rmdirDir(rmdirPath: string, params: connectParams): Promise<boolean> {
        const Client = require('ftp');
        this.ftpClient = new Client();
        return new Promise(resolve => {
            this.ftpClient.on('ready' ,() => {
                this.ftpClient.rmdir(rmdirPath ,(err) => {
                    resolve(err ? false : true);
                    this.ftpClient.end(); 
                    if (err) throw err;
                });
            });
            this.ftpClient.connect(params);
        });
    }
}
