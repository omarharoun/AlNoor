/*
 * Copyright (C) 2026 Fluxer Contributors
 *
 * This file is part of Fluxer.
 *
 * Fluxer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Fluxer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Fluxer. If not, see <https://www.gnu.org/licenses/>.
 */

import type {EmailMessage, IEmailProvider} from '@fluxer/email/src/EmailProviderTypes';
import {createLogger} from '@fluxer/logger/src/Logger';
import nodemailer from 'nodemailer';

const logger = createLogger('@fluxer/email/src/SmtpEmailProvider');

export interface SmtpEmailConfig {
        host: string;
        port: number;
        username: string;
        password: string;
        secure?: boolean;
        connectionTimeoutMs?: number;
        greetingTimeoutMs?: number;
        socketTimeoutMs?: number;
}

export class SmtpEmailProvider implements IEmailProvider {
        private readonly transporter: nodemailer.Transporter;
        private readonly envelopeFrom?: string;

        constructor(config: SmtpEmailConfig) {
                this.transporter = nodemailer.createTransport({
                        host: config.host,
                        port: config.port,
                        secure: config.secure ?? true,
                        auth: {
                                user: config.username,
                                pass: config.password,
                        },
                        connectionTimeout: config.connectionTimeoutMs,
                        greetingTimeout: config.greetingTimeoutMs,
                        socketTimeout: config.socketTimeoutMs,
                });
                this.envelopeFrom = isPlausibleEmail(config.username) ? config.username : undefined;
        }

        async sendEmail(message: EmailMessage): Promise<boolean> {
                try {
                        const mailOptions: nodemailer.SendMailOptions = {
                                to: message.to,
                                from: `${message.from.name} <${message.from.email}>`,
                                subject: message.subject,
                                text: message.text,
                        };

                        // Some providers (including Resend SMTP) use non-email usernames (e.g. "resend").
                        // Only force MAIL FROM to auth user when that username is a valid email address.
                        if (this.envelopeFrom) {
                                mailOptions.envelope = {from: this.envelopeFrom, to: message.to};
                        }

                        await this.transporter.sendMail(mailOptions);
                        logger.debug({to: message.to}, 'Email sent via SMTP');
                        return true;
                } catch (error) {
                        logger.error({error}, 'SMTP send failed');
                        return false;
                }
        }
}

function isPlausibleEmail(value: string): boolean {
        // Basic gate to avoid invalid MAIL FROM values such as "resend".
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
