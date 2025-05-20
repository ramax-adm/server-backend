import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sensatta_account_custom_groups')
export class AccountCustomGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_group_code' })
  customGroupId: string;

  @Column({ name: 'account_code' })
  accountCode: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
