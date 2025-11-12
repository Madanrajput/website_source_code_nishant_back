import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('seo_tag')
export class SeoTag {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    meta_description: string;

    @Column()
    page_name: string;

    @Column()
    meta_can_tag: string;

    @Column()
    meta_image: string;

  
    @Column({
        type: 'enum',
        enum: ['active', 'inactive'],
        default: 'active'
    })
    status: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;
}
