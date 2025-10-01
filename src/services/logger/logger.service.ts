// logger.service.ts
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class LoggerService {
    private static isEnabled = true;
    private static logs: string[] = [];

    static start() {
        this.isEnabled = true;
        this.logs = []; // reset
        this.info('Logger started!');
    }

    static stop() {
        this.info('Logger stopped!');
        this.isEnabled = false;
    }

    static log(level: LogLevel, tag: string, message: any, ...optional: any[]) {
        if (!this.isEnabled) return;

        const time = new Date().toISOString();
        const logMessage = `[${time}] [${tag}] [${level.toUpperCase()}] ${message}`;

        this.logs.push(logMessage);

        switch (level) {
            case 'debug': console.debug(logMessage, ...optional); break;
            case 'info': console.info(logMessage, ...optional); break;
            case 'warn': console.warn(logMessage, ...optional); break;
            case 'error': console.error(logMessage, ...optional); break;
        }
    }

    static debug(tag: string, message: any = '', ...opt: any[]) {
        this.log('debug', tag, message, ...opt);
    }

    static info(tag: string, message: any = '', ...opt: any[]) {
        this.log('info', tag, message, ...opt);
    }

    static warn(tag: string, message: any = '', ...opt: any[]) {
        this.log('warn', tag, message, ...opt);
    }

    static error(tag: string, message: any = '', ...opt: any[]) {
        this.log('error', tag, message, ...opt);
    }

    static getLogs() {
        return this.logs;
    }

    static saveToFile() {
        const blob = new Blob([this.logs.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const time = new Date().toLocaleDateString() + '-' + new Date().toLocaleTimeString();
        a.href = url;
        a.download = `logs-${time}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
}
