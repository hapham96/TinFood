import { useMemo } from 'react';
import { LoggerService } from './logger.service';

export function useLogger(tag: string = 'App') {
    return useMemo(() => ({
        debug: (msg: any, ...opt: any[]) => LoggerService.debug(tag, msg, ...opt),
        info: (msg: any, ...opt: any[]) => LoggerService.info(tag, msg, ...opt),
        warn: (msg: any, ...opt: any[]) => LoggerService.warn(tag, msg, ...opt),
        error: (msg: any, ...opt: any[]) => LoggerService.error(tag, msg, ...opt),
        getLogs: () => LoggerService.getLogs(),
        saveToFile: () => LoggerService.saveToFile(),
        stop: () => LoggerService.stop(),
        start: () => LoggerService.start(),
    }), [tag]);
}
