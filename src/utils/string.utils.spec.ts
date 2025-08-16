import { StringUtils } from './string.utils';

describe('test', () => {
  it('pass', () => {
    expect(2 + 2).toBe(4);
  });
  it('fix encoding', () => {
    const textoOriginal = 'REMESSA PARA DEP�SITO FECHADO OU ARMAZ�M';
    const corrigido = StringUtils.fixEncoding(textoOriginal);
    console.log(corrigido); // "REMESSA PARA DEPÓSITO FECHADO OU ARMAZÉM"
    expect(corrigido).toBeDefined();
  });

  it('recover', () => {
    const textoOriginal = 'M�e';
    const corrigido = StringUtils.tryRecoverString(textoOriginal);
    console.log(corrigido); // "REMESSA PARA DEPÓSITO FECHADO OU ARMAZÉM"
    expect(corrigido).toBeDefined();
  });
});
