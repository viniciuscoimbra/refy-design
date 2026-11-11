import { tr } from "../RefySitePage/i18n";
import { useState } from 'react';
import type { RefyTheme } from '../../lib/ThemeProvider';
import { AreaChart, Button, Card, CardHeader, Segmented, ThemeProvider } from '../../index';
import manifest from './chart-reference/manifest.json';
import styles from './ChartComparison.module.css';

const captures = import.meta.glob('./chart-reference/*.jpg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const names = ['Área simples', 'Traçado linear', 'Área empilhada'];

export function ChartComparison({ theme, onBack }: { theme: RefyTheme; onBack: () => void }) {
  const [variant, setVariant] = useState('default');
  const sample = manifest.variants.find(item => item.id === variant)!;
  const title = variant === 'default' ? 'Area Chart' : `Area Chart - ${variant === 'linear' ? 'Linear' : 'Stacked'}`;
  return <main className={styles.page} aria-label={tr("Comparação de charts")}>
    <header><Button variant="ghost" onClick={onBack}>{tr("Voltar aos charts")}</Button><h1>{tr("Charts · referência e Refy")}</h1>
      <p>Mesmos dados, meses e janela de 373 × 460 px. À esquerda, captura original estática; à direita, o componente Refy interativo atual. Esta é uma revisão, ainda sem aprovação visual.</p>
      <a href={manifest.reference} target="_blank" rel="noreferrer">{tr("Abrir referência shadcn ↗")}</a>
    </header>
    <Segmented label={tr("Variação da comparação")} value={variant} onChange={setVariant} options={manifest.variants.map((item, index) => ({ value: item.id, label: names[index] }))} />
    {(['light', 'dark'] as const).map(mode => <section key={mode} aria-label={mode === 'light' ? tr("Comparação clara") : tr("Comparação escura")}>
      <h2>{mode === 'light' ? tr("Claro") : tr("Escuro")}</h2>
      <div className={styles.scroll} tabIndex={0} aria-label={`Comparar lado a lado · ${mode === 'light' ? 'claro' : 'escuro'}`}>
        <div className={styles.pair}>
          <div><h3>{tr("shadcn · Recharts")}</h3><p>{tr("Captura original · 23/10/2026")}</p><img className={styles.capture} src={captures[`./chart-reference/${variant}-${mode}.jpg`]} width={373} height={460} alt={`${title} original no modo ${mode === 'light' ? 'claro' : 'escuro'}`} /></div>
          <div><h3>{tr("Refy · D3")}</h3><p>{tr("Componente real · tema personalizável")}</p><ThemeProvider isolate theme={theme} mode={mode} className={styles.live} data-testid={`chart-comparison-${mode}`}>
            <Card><CardHeader title={title} /><p className={styles.description}>{tr("Showing total visitors for the last 6 months")}</p>
              <AreaChart title={title} showTitle={false} label={`${title} · ${mode}`} xLabels={sample.labels} data={variant === 'stacked' ? undefined : sample.desktop} series={variant === 'stacked' ? [{ name: 'Desktop', data: sample.desktop, tone: 'primary' }, { name: 'Mobile', data: sample.mobile, tone: 'info' }] : undefined} stacked={variant === 'stacked'} curve={variant === 'linear' ? 'linear' : 'smooth'} />
              <footer className={styles.footer}><strong>{tr("Trending up by 5.2% this month ↗")}</strong><span>{tr("January - June 2024")}</span></footer>
            </Card>
          </ThemeProvider></div>
        </div>
      </div>
    </section>)}
    <section className={styles.notes}><h2>{tr("O que estamos comparando")}</h2>
      <p>Desktop: {sample.desktop.join(', ')}{variant === 'stacked' && ` · Mobile: ${sample.mobile.join(', ')}`}. O percentual no rodapé reproduz o texto da referência; não é calculado a partir destes dados.</p>
      <ul><li>{tr("Curva: shadcn usa natural nas áreas simples e empilhada. O Refy atual usa monotônica. A linear usa segmentos retos em ambos.")}</li><li>{tr("O Refy mantém eixo Y, legenda na versão empilhada e tabela de dados. A referência tem uma composição mais compacta, sem eixo Y visível.")}</li><li>{tr("Cores, fontes, preenchimentos e espaçamentos ainda diferem. Personalizar tema altera apenas o Refy; a captura preserva a identidade original.")}</li></ul>
      <h2>{tr("Motores e próximos critérios")}</h2>
      <p><strong>{tr("Já entregue:")}</strong> {tr("D3 para área, linha, barras, rosca e tendência compacta. Não há uma nova biblioteca instalada nesta comparação.")}</p>
      <ul><li><a href="https://d3js.org/what-is-d3" target="_blank" rel="noreferrer">D3</a>{tr(": manter como base de geometria e escalas; primeiro melhorar composição, curvas e tokens dos gráficos atuais.")}</li><li><a href="https://ui.shadcn.com/docs/components/base/chart" target="_blank" rel="noreferrer">{tr("Recharts")}</a> {tr("(MIT): candidato para composição declarativa e paridade das variações da referência.")}</li><li><a href="https://echarts.apache.org/en/feature.html" target="_blank" rel="noreferrer">{tr("Apache ECharts")}</a> {tr("(Apache-2.0): candidato para heatmaps, relações, mapas e maior volume de dados; exige prova de desempenho e acessibilidade.")}</li><li><a href="https://observablehq.github.io/plot/what-is-plot" target="_blank" rel="noreferrer">{tr("Observable Plot")}</a> {tr("(ISC): candidato para exploração estatística com marcas, transformações e facetas.")}</li></ul>
      <p>{tr("Antes de integrar outro motor: validar uma família real, teclado, tabela de dados, tooltip, legenda, responsividade, dois modos e custo no pacote. Candidatos ainda não fazem parte da API do Refy.")}</p>
      <p><strong>{tr("Blocks pendentes:")}</strong> {tr("a apresentação atual foi rejeitada. A próxima revisão deve trazer catálogo por categoria, variações identificadas, prévia, código e composição, conforme a referência. Nenhuma alteração em Blocks nesta etapa.")}</p>
    </section>
  </main>;
}
