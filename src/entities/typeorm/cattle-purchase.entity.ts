import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'sensatta_cattle_purchases' })
export class CattlePurchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'slaughter_date', type: 'date' })
  slaughterDate: Date;

  @Column({ name: 'purchase_cattle_order_id' })
  purchaseCattleOrderId: string;

  @Column({ name: 'cattle_owner_code' })
  cattleOwnerCode: string;

  @Column({ name: 'cattle_owner_name' })
  cattleOwnerName: string;

  @Column({ name: 'company_code' })
  companyCode: string;

  @Column({ name: 'company_name' })
  companyName: string;

  @Column({ name: 'cattle_advisor_code' })
  cattleAdvisorCode: string;

  @Column({ name: 'cattle_advisor_name' })
  cattleAdvisorName: string;

  @Column({ name: 'cattle_quantity' })
  cattleQuantity: number;

  @Column({ name: 'cattle_classification' })
  cattleClassification: string;

  //@Column({name:''})
  //weight: string;

  @Column({ name: 'cattle_weight_in_arroba', type: 'float4' })
  cattleWeightInArroba: number;

  @Column({ name: 'payment_term', type: 'int' })
  paymentTerm: number;

  @Column({ name: 'freight_price', type: 'float4' })
  freightPrice: number;

  @Column({ name: 'purchase_price', type: 'float4' })
  purchasePrice: number;

  @Column({ name: 'commission_price', type: 'float4' })
  commissionPrice: number;

  @Column({ name: 'total_value', type: 'float4' })
  totalValue: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
