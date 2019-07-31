

class CpuListParams {
    model: string
    speed: number
    times: CpuTimeParams

}
class CpuTimeParams {
    idle: number
    irq: number
    nice: number
    sys: number
    user: number
}
class networkParams {
    address: string
    cidr: string
    family: string
    internal: boolean
    mac: string
    netmask: string
    scopeid?: number
}

export class ComputerInfoService {

    private os;
    constructor() {
        this.os = require('os')
    }

    /* 获取系统用户名*/
    getHostName(): string {
        return this.os.hostname();
    }

    /* 获取个人用户名*/
    getUserName(): string {
        return this.os.userInfo().username;
    }

    /* 获取系统类型*/
    getPlatform(): string {
            return this.os.platform();
    }

    /* 获取系统是多少位*/
    getArch(): string {
        return this.os.arch();;
    }

    /*获取CPU的信息  */
    getCPUList(): CpuListParams[] {
        return this.os.cpus();
    }

    /*获取系统的内存量 以为字节为单位 */
    getFreemem():number {
        return this.os.freemem();
    }

    /*获取系统的内存总量 以为字节为单位 */
    getTotalmem(): number {
        return this.os.totalmem();
    }

    /*获取系统的ip address */
    getIpAddress(): string {
        let IPAddress: string;
        const networkList: Array<networkParams[]> = this.os.networkInterfaces()
        Object.keys(networkList).forEach((networkInterList_v: string) => {
            networkList[networkInterList_v].forEach((networkInter_v: networkParams) => {
                if (networkInter_v.family === 'IPv4' && networkInter_v.address !== '127.0.0.1' && !networkInter_v.internal) {
                    IPAddress = networkInter_v.address;
                }
            })
        });
        return IPAddress;
    }

    /*获取系统的mac address */
    getMacAddress(): string {
        let macAddress: string;
        const networkList: Array<networkParams[]> = this.os.networkInterfaces()
        Object.keys(networkList).forEach((networkInterList_v: string) => {
            networkList[networkInterList_v].forEach((networkInter_v: networkParams) => {
                if (networkInter_v.address !== '127.0.0.1' && !networkInter_v.internal) {
                    macAddress = networkInter_v.mac;
                }
            })
        });
        return macAddress;
    }

    /*获取系统的名称 */
    getSysteamType(): string {
        return this.os.type();
    }

}