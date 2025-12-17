import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'temp_historico_refaturamento' })
export class TempHistoricoRefaturamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'CODIGO_EMPRESA', nullable: true })
  CODIGO_EMPRESA?: string;

  @Column({ name: 'PEDIDO_FATURAMENTO', nullable: true })
  PEDIDO_FATURAMENTO?: string;

  @Column({ name: 'ID_NF_FATURAMENTO', nullable: true })
  ID_NF_FATURAMENTO?: string;

  @Column({ name: 'NF_FATURAMENTO', nullable: true })
  NF_FATURAMENTO?: string;

  @Column({ name: 'BO', nullable: true })
  BO?: string;

  @Column({ name: 'NF_DEVOLUCAO', nullable: true })
  NF_DEVOLUCAO?: string;

  @Column({ name: 'SEQUENCIA_REFATURAMENTO', nullable: true })
  SEQUENCIA_REFATURAMENTO?: string;

  @Column({ name: 'PEDIDO_REFATURAMENTO', nullable: true })
  PEDIDO_REFATURAMENTO?: string;

  @Column({ name: 'ID_NF_REFATURAMENTO', nullable: true })
  ID_NF_REFATURAMENTO?: string;

  @Column({ name: 'NF_REFATURAMENTO', nullable: true })
  NF_REFATURAMENTO?: string;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
