import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PopupRule } from './entities/popup-rule.entity';

@Injectable()
export class PopupRulesService {
    constructor(
        @InjectRepository(PopupRule)
        private popupRuleRepo: Repository<PopupRule>,
    ) {}

    private normalizePath(input?: string) {
        const trimmedValue = (input || '').trim();
        if (!trimmedValue || trimmedValue === '*') return '*';
        let normalizedPath = trimmedValue.startsWith('/') ? trimmedValue : `/${trimmedValue}`;
        if (normalizedPath.length > 1) normalizedPath = normalizedPath.replace(/\/+$/, '');
        return normalizedPath || '/';
    }

    private appendBaseUrl(rule: PopupRule) {
        if (!rule) return null;
        const baseUrl = `${process.env.BASE_URL || 'http://localhost:9999'}/uploads/popups/`;
        if (rule.desktop_image && !rule.desktop_image.startsWith('http')) {
            rule.desktop_image = `${baseUrl}${rule.desktop_image}`;
        }
        if (rule.mobile_image && !rule.mobile_image.startsWith('http')) {
            rule.mobile_image = `${baseUrl}${rule.mobile_image}`;
        }
        return rule;
    }

    async findAll() {
        const rules = await this.popupRuleRepo.find({ order: { created_at: 'DESC' } });
        return rules.map(rule => this.appendBaseUrl(rule));
    }

    async createOrUpdate(dto: any, desktopPath?: string, mobilePath?: string) {
        const targetUrl = this.normalizePath(dto.target_url);
        
        const sanitizedDto: any = {
            target_url: targetUrl,
            is_enabled: dto.is_enabled === 'true' || dto.is_enabled === true,
            show_mobile: dto.show_mobile === 'true' || dto.show_mobile === true,
            show_desktop: dto.show_desktop === 'true' || dto.show_desktop === true,
            trigger_type: dto.trigger_type || 'time',
            delay_seconds: parseInt(dto.delay_seconds, 10) || 6,
            scroll_percentage: parseInt(dto.scroll_percentage, 10) || 50,
            heading: dto.heading?.trim() || "Let's build your dream space.",
            sub_heading: dto.sub_heading?.trim() || "",
            cta_text: dto.cta_text?.trim() || 'GET FREE QUOTE',
            lead_form_name: dto.lead_form_name?.trim() || `Lead Form ${targetUrl}`,
            redirect_url: dto.redirect_url?.trim() || '/thank-you',
            success_message: dto.success_message?.trim() || 'Details submitted successfully!',
        };

        if (desktopPath) sanitizedDto.desktop_image = desktopPath;
        if (mobilePath) sanitizedDto.mobile_image = mobilePath;

        let rule;
        
        if (dto.id) {
            rule = await this.popupRuleRepo.findOne({ where: { id: parseInt(dto.id, 10) } });
            if (!rule) throw new NotFoundException('Rule not found');
            Object.assign(rule, sanitizedDto);
        } else {
            rule = await this.popupRuleRepo.findOne({ where: { target_url: targetUrl } });
            if (rule) {
                 Object.assign(rule, sanitizedDto);
            } else {
                 rule = this.popupRuleRepo.create(sanitizedDto);
            }
        }
        
        return this.popupRuleRepo.save(rule);
    }

    async resolveForPath(path?: string) {
        const normalizedPath = this.normalizePath(path);
        let match = await this.popupRuleRepo.findOne({ where: { target_url: normalizedPath } });
        if (!match) {
            match = await this.popupRuleRepo.findOne({ where: { target_url: '*' } });
        }
        return this.appendBaseUrl(match);
    }

    async remove(id: number) {
        const rule = await this.popupRuleRepo.findOne({ where: { id } });
        if (!rule) throw new NotFoundException('Rule not found');
        return this.popupRuleRepo.remove(rule);
    }
}