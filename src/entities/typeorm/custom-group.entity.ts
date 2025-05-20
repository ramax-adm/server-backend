import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sensatta_custom_groups')
export class CustomGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_group_code' })
  accountGroupCode: string;

  @Column()
  name: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
