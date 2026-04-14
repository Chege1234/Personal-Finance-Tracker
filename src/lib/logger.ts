/**
 * Security-focused logging utility.
 * In development: Logs everything to the console.
 * In production: Suppresses debug info, logs errors and security events.
 * Can be extended to send logs to a remote service like Sentry or LogRocket.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'security';

interface LogEntry {
    level: LogLevel;
    message: string;
    context?: any;
    timestamp: string;
}

const IS_PROD = import.meta.env.PROD;

class Logger {
    private formatMessage(level: LogLevel, message: string, context?: any): LogEntry {
        return {
            level,
            message,
            context,
            timestamp: new Date().toISOString()
        };
    }

    private log(entry: LogEntry) {
        if (IS_PROD) {
            // In production, we only log security events, warnings, and errors
            if (entry.level === 'debug' || entry.level === 'info') return;

            // Here you would typically send logs to a remote service
            // For now, we use console but in a controlled way
            const formatted = `[${entry.level.toUpperCase()}] ${entry.message}`;
            if (entry.level === 'error' || entry.level === 'security') {
                console.error(formatted, entry.context || '');
            } else {
                console.warn(formatted, entry.context || '');
            }
        } else {
            const styles = {
                debug: 'color: #7f8c8d',
                info: 'color: #3498db',
                warn: 'color: #f39c12',
                error: 'color: #e74c3c; font-weight: bold',
                security: 'color: #9b59b6; font-weight: bold; background: #2c3e50; padding: 2px 4px; border-radius: 2px'
            };

            console.log(
                `%c[${entry.level.toUpperCase()}] %c${entry.message}`,
                styles[entry.level],
                'color: inherit',
                entry.context || ''
            );
        }
    }

    debug(message: string, context?: any) {
        this.log(this.formatMessage('debug', message, context));
    }

    info(message: string, context?: any) {
        this.log(this.formatMessage('info', message, context));
    }

    warn(message: string, context?: any) {
        this.log(this.formatMessage('warn', message, context));
    }

    error(message: string, error?: any) {
        // Extract useful info from Error objects but avoid leaking stack traces in UI if possible
        const context = error instanceof Error 
            ? { name: error.name, message: error.message, stack: error.stack }
            : error;
        this.log(this.formatMessage('error', message, context));
    }

    security(message: string, context?: any) {
        this.log(this.formatMessage('security', message, context));
    }
}

export const logger = new Logger();
