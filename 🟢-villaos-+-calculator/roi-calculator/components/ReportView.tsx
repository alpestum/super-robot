
import React from 'react';
import { CalculatedData, VillaInputs, YearProjection } from '../types';
import YearlyBreakdownChart from './charts/YearlyBreakdownChart';
import CashflowChart from './charts/CashflowChart';
import { LOGO_URL, REPORT_APP_NAME } from '../constants'; // Import REPORT_APP_NAME

interface ReportViewProps {
  data: CalculatedData | null;
  inputs: VillaInputs;
}

const formatCurrencyForReport = (value: number | null | undefined, defaultVal: string = 'N/A') => {
  if (value == null || !isFinite(value)) return defaultVal;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const formatPercentageForReport = (value: number | null | undefined, precision: number = 1, defaultVal: string = 'N/A') => {
  if (value == null || !isFinite(value)) return defaultVal;
  return `${(value * 100).toFixed(precision)}%`;
};

const formatYearsForReport = (value: number | null | undefined, defaultVal: string = 'N/A') => {
  if (value == null || !isFinite(value)) return defaultVal;
  if (value < 0.1 && value !== 0) return "<0.1 Yrs";
  return `${value.toFixed(1)} Years`;
};

const ScenarioParameter: React.FC<{ label: string; value: string | number; valueClass?: string }> = ({ label, value, valueClass }) => (
  <>
    <div className="report-param-label">{label}</div>
    <div className={`report-param-value ${valueClass || ''}`}>{value}</div>
  </>
);

const ReportView: React.FC<ReportViewProps> = ({ data, inputs }) => {
  if (!data) {
    return (
      <div className="report-view-container">
        <main className="report-container">
          <section className="report-page">
            <h2>Report Not Available</h2>
            <p>Please calculate the yield to view the report.</p>
          </section>
        </main>
      </div>
    );
  }

  const {
    yearlyProjections,
    breakEvenYear,
    paybackPeriodInYears,
    averageAnnualNetYieldPercent,
    averageOverallDailyRate, 
    averageFirstFiveYearsOccupancy,
    averageFirstFiveYearsIncome,
    averageFirstFiveYearsRevenue,
    averageFirstFiveYearsCosts,
    resaleStrategyAtYear5,
    totalAdditionalCosts, // Renamed
    additionalCostImpactDetails, // Renamed
  } = data;

  const costBalancingFromRevenue = (inputs.managementFeePercent + inputs.utilitiesMaintenancePercent + inputs.taxesPercent);

  let estSalePriceCardValue = 'N/A';
  let estSalePriceCardDescription = "";
  if (inputs.enableResaleStrategy && resaleStrategyAtYear5) {
    if (resaleStrategyAtYear5.grossResaleValueBeforeCosts === 0 || resaleStrategyAtYear5.grossResaleValueBeforeCosts === null) {
      estSalePriceCardValue = 'N/A (Unprofitable/Lease Ends)';
      estSalePriceCardDescription = "Resale not projected due to unprofitability based on 5-year average profit or lease ending too soon for resale estimation.";
    } else {
      estSalePriceCardValue = formatCurrencyForReport(resaleStrategyAtYear5.grossResaleValueBeforeCosts);
      let netToSellerText = `Net to seller`;
      const deductions = [];
      if (inputs.applySaleTaxOnResale) deductions.push(`${inputs.saleTaxRateOnResale * 100}% tax`);
      if (inputs.applyAgencyCommissionOnResale) deductions.push(`${inputs.agencyCommissionRateOnResale * 100}% commission`);
      if (deductions.length > 0) netToSellerText += ` after ${deductions.join(' & ')}`;
      netToSellerText += `: <strong>${formatCurrencyForReport(resaleStrategyAtYear5.projectedResaleValue)}</strong>`;
      
      estSalePriceCardDescription = `Est. market price. Based on average operational net profit of the first 5 years, multiplier, lease adjustment. ${netToSellerText}`;
    }
  }

  const projectionsToDisplayInTable = yearlyProjections.slice(0, 10);
  const chartProjectionsToDisplay = yearlyProjections.slice(0, 10);
  
  const showAdditionalCostsPage = inputs.enableAdditionalCosts && inputs.additionalCosts.length > 0;
  const totalPages = 5 + (showAdditionalCostsPage ? 1 : 0);
  
  const alternativeStrategyDescriptionHtml = `This scenario explores an alternative approach: operating the villa for 5 years and then selling it as an ongoing rental business. The resale value is estimated based on its average operational net profit of the first 5 years, a ${inputs.resaleProfitMultiplier}x multiplier, and adjusted for remaining lease years. ${inputs.applySaleTaxOnResale ? `A ${inputs.saleTaxRateOnResale * 100}% sales tax` : ''}${inputs.applySaleTaxOnResale && inputs.applyAgencyCommissionOnResale ? ' and ' : ''}${inputs.applyAgencyCommissionOnResale ? `a ${inputs.agencyCommissionRateOnResale * 100}% agency commission` : ''} ${inputs.applySaleTaxOnResale || inputs.applyAgencyCommissionOnResale ? 'are applied to the gross resale value if enabled.' : ''} This calculation does not take into account market growth but account for asset depreciation due to the nature of leasehold contracts, of which you can read a complete explanation <a href='https://www.thebalihomes.com/blog/pros-and-cons-leasehold-properties-in-bali' target='_blank' rel='noopener noreferrer' style='color: var(--color-primary); text-decoration: underline;'>here</a>.`;

  const additionalCostsPageExplanation = "This section details the financial impact of planned additional costs or capital expenditures. These could include expenses for initial acquisition beyond the property price (e.g., lawyer fees, company setup), renovations, extraordinary maintenance, or other significant capital expenditures during the lease. Understanding these costs provides a clearer picture of the total investment and its effect on cash flow. While predicting exact future costs like construction or market dynamics for resale valuation post-investment is complex and beyond this projection's scope, this analysis highlights anticipated capital outflows and their immediate financial consequences.";

  return (
    <div className="report-view-container">
      <main className="report-container">
        {/* Page 1: Main Overview */}
        <section className="report-page">
          <header className="report-header">
            <div className="report-logo">
              <img src={LOGO_URL} alt="The Bali Homes Logo" />
            </div>
            <div className="report-property-intro">
              <h1>{inputs.title || "Villa Report"}</h1>
              <p>{inputs.description || "Detailed financial projection report."}</p>
            </div>
            <div className="report-property-image">
              {inputs.imageUrl ? <img src={inputs.imageUrl} alt={inputs.title || "Villa Image"} /> : <div style={{height: '200px', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: '#777'}}>No Image Provided</div>}
            </div>
          </header>

          <div className="report-content-section">
            <h2>Main strategy: Rent until lease expire</h2>
            <p>This section outlines the financial projections for the property performance. Unless specified differently, most values and averages refer to the first five years of operation. This is done to output a more accurate prediction based on average market performance overtime. {inputs.enableAdditionalCosts && inputs.additionalCosts.length > 0 ? "Costs for additional expenditures are factored into the cash flow projections." : ""}</p>
          </div>

          <div className="report-content-section">
            <h3>Investment highlights</h3>
            <div className="report-card-grid-3">
              <div className="report-card">
                <span className="report-card-title">Est. payback period</span>
                <span className="report-card-value">{formatYearsForReport(paybackPeriodInYears, breakEvenYear ? `Year ${breakEvenYear}` : 'N/A')}</span>
                <span className="report-card-description">Time for cumulative cash flow (incl. additional costs if any) to cover initial investment.</span>
              </div>
              <div className="report-card">
                <span className="report-card-title">Average yearly net yield</span>
                <span className="report-card-value">{formatPercentageForReport(averageAnnualNetYieldPercent)}</span>
                <span className="report-card-description">Avg. annual return from net operational profits in first 5 years vs. property price.</span>
              </div>
              <div className={`report-card ${averageFirstFiveYearsIncome && averageFirstFiveYearsIncome > 0 ? 'report-card-profit' : (averageFirstFiveYearsIncome && averageFirstFiveYearsIncome < 0 ? 'report-card-cost' : '')}`}>
                <span className="report-card-title">Average yearly net income</span>
                <span className="report-card-value">{formatCurrencyForReport(averageFirstFiveYearsIncome)}</span>
                <span className="report-card-description">Avg. net operational profit per year over initial 5 years.</span>
              </div>
              <div className="report-card">
                <span className="report-card-title">Average daily rate</span>
                <span className="report-card-value">{formatCurrencyForReport(averageOverallDailyRate)}</span>
                <span className="report-card-description">Avg. rental income per occupied day over initial 5 years.</span>
              </div>
              <div className="report-card">
                <span className="report-card-title">Lease duration</span>
                <span className="report-card-value">{inputs.leaseYears} years</span>
                <span className="report-card-description">Total term of the property leasehold agreement.</span>
              </div>
              <div className="report-card">
                <span className="report-card-title">Average occupancy rate</span>
                <span className="report-card-value">{formatPercentageForReport(averageFirstFiveYearsOccupancy)}</span>
                <span className="report-card-description">Avg. percentage villa is occupied by paying guests over initial 5 years.</span>
              </div>
            </div>
          </div>
          
          <div className="report-content-section">
            <h3>Cumulative Cash Flow</h3>
            <p className="sub-heading">Total cash position year-by-year for the main strategy (until lease end{inputs.enableAdditionalCosts && inputs.additionalCosts.length > 0 ? ", including additional costs/expenditures" : ""})</p>
            <div className="report-chart-container">
              <CashflowChart 
                data={yearlyProjections} 
                propertyPrice={inputs.propertyPrice} 
                paybackPeriodInYears={paybackPeriodInYears}
                isForPdf={false}
              />
            </div>
          </div>
          <footer className="report-page-footer">Page 1/{totalPages}</footer>
        </section>

        {/* Page 2: Financial Performance */}
        <section className="report-page">
          <div className="report-content-section">
            <h3>Annual Financial Performance (Operational)</h3>
            <p className="sub-heading">Snapshot of Revenue, Operational Costs, and Operational Net Profit for the main strategy (first 10 years). Costs for additional expenditures impact cash flow directly, not these operational figures.</p>
             <div className="report-chart-container">
                <YearlyBreakdownChart data={chartProjectionsToDisplay} isForPdf={false} />
             </div>
          </div>

          <div className="report-content-section">
            <h3>Metrics (First 5 Years Average - Operational)</h3>
            <div className="report-card-grid-3">
                 <div className="report-card">
                    <span className="report-card-title">Average yearly revenue</span>
                    <span className="report-card-value">{formatCurrencyForReport(averageFirstFiveYearsRevenue)}</span>
                    <span className="report-card-description">Average total revenue per year from operations in first 5 years.</span>
                </div>
                 <div className="report-card">
                    <span className="report-card-title">Cost balancing from revenue</span>
                    <span className="report-card-value">{formatPercentageForReport(costBalancingFromRevenue)}</span>
                    <span className="report-card-description">Total % from revenue for Management, Utilities/Maint., and Taxes.</span>
                </div>
                 <div className="report-card report-card-cost">
                    <span className="report-card-title">Average yearly cost</span>
                    <span className="report-card-value">{formatCurrencyForReport(averageFirstFiveYearsCosts)}</span>
                    <span className="report-card-description">Average total operational costs per year in first 5 years.</span>
                </div>
            </div>
          </div>

          <div className="report-content-section">
            <h3>Detailed Yearly Projections (First 10 Years)</h3>
            <div className="report-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Year</th>
                            <th>Revenue</th>
                            <th>Op. Costs</th>
                            <th>Op. Net Profit</th>
                            {inputs.enableAdditionalCosts && inputs.additionalCosts.length > 0 && <th>Add. Cost/Exp.</th>}
                            <th>Cash Flow (Net)</th>
                            <th>Avg. Occupancy</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projectionsToDisplayInTable.map((p) => (
                           <tr key={`main-${p.year}`}>
                                <td>{p.year}</td>
                                <td>{formatCurrencyForReport(p.revenue)}</td>
                                <td>{formatCurrencyForReport(p.totalCosts)}</td>
                                <td className={p.netProfit >= 0 ? 'report-text-positive' : 'report-text-negative'}>{formatCurrencyForReport(p.netProfit)}</td>
                                {inputs.enableAdditionalCosts && inputs.additionalCosts.length > 0 && <td className={p.additionalCostInYear && p.additionalCostInYear > 0 ? 'report-text-negative' : ''}>{formatCurrencyForReport(p.additionalCostInYear)}</td>}
                                <td className={p.cumulativeCashFlow >= 0 ? 'report-text-positive' : 'report-text-negative'}>{formatCurrencyForReport(p.cumulativeCashFlow)}</td>
                                <td>{formatPercentageForReport(p.avgOccupancy)}</td>
                           </tr>
                        ))}
                    </tbody>
                </table>
                {yearlyProjections.length > 10 && (
                    <p className="report-table-caption">Showing first 10 of {yearlyProjections.length} years.</p>
                )}
            </div>
          </div>
          <footer className="report-page-footer">Page 2/{totalPages}</footer>
        </section>

        {/* Page 3: 5-Year Exit Strategy */}
        <section className="report-page">
            {inputs.enableResaleStrategy && inputs.leaseYears >= 5 && resaleStrategyAtYear5 ? (
                <>
                    <div className="report-content-section">
                        <h3>Alternative Strategy: Operate for 5 Years and Sell</h3>
                        <p dangerouslySetInnerHTML={{ __html: alternativeStrategyDescriptionHtml }}></p>
                    </div>
                    
                    <div className="report-content-section">
                         <div className="report-table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Year</th>
                                        <th>Revenue</th>
                                        <th>Op. Costs</th>
                                        <th>Op. Net Profit</th>
                                        { (inputs.enableAdditionalCosts && resaleStrategyAtYear5.yearlyProjectionsForStrategy.some(p => p.additionalCostInYear && p.additionalCostInYear > 0)) && <th>Add. Cost/Exp.</th>}
                                        <th>Cash Flow (Strategy)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resaleStrategyAtYear5.yearlyProjectionsForStrategy.map((p, index) => (
                                       <tr key={`resale-${p.year}`}>
                                            <td>{p.year}</td>
                                            <td>{formatCurrencyForReport(p.revenue)}</td>
                                            <td>{formatCurrencyForReport(p.totalCosts)}</td>
                                            <td className={p.netProfit >= 0 ? 'report-text-positive' : 'report-text-negative'}>{formatCurrencyForReport(p.netProfit)}</td>
                                            { (inputs.enableAdditionalCosts && resaleStrategyAtYear5.yearlyProjectionsForStrategy.some(proj => proj.additionalCostInYear && proj.additionalCostInYear > 0)) && <td className={p.additionalCostInYear && p.additionalCostInYear > 0 ? 'report-text-negative' : ''}>{formatCurrencyForReport(p.additionalCostInYear)}</td>}
                                            <td className={p.cumulativeCashFlow >= 0 ? 'report-text-positive' : 'report-text-negative'}>
                                                {formatCurrencyForReport(p.cumulativeCashFlow)}
                                                {index === 4 && resaleStrategyAtYear5.projectedResaleValue !== null && resaleStrategyAtYear5.projectedResaleValue > 0 && <span style={{fontSize: '0.8em', display: 'block'}}>(incl. Net Resale)</span>}
                                            </td>
                                       </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {resaleStrategyAtYear5.finalCumulativeCashFlowIncludingResale !== null && (
                            <p className={`report-table-caption ${resaleStrategyAtYear5.finalCumulativeCashFlowIncludingResale > 0 ? 'report-text-positive' : (resaleStrategyAtYear5.finalCumulativeCashFlowIncludingResale === 0 ? '' : 'report-text-negative')}`}>
                                This strategy projects a {resaleStrategyAtYear5.finalCumulativeCashFlowIncludingResale > 0 ? 'positive' : (resaleStrategyAtYear5.finalCumulativeCashFlowIncludingResale === 0 ? 'break-even' : 'negative')} net profit, indicating a {resaleStrategyAtYear5.finalCumulativeCashFlowIncludingResale > 0 ? 'potentially profitable' : (resaleStrategyAtYear5.finalCumulativeCashFlowIncludingResale === 0 ? 'break-even' : 'loss-making')} outcome for this specific 5-year exit scenario.
                            </p>
                        )}
                    </div>

                    <div className="report-content-section">
                        <div className="report-card-grid-3">
                             <div className="report-card">
                                <span className="report-card-title">Est. sale price</span>
                                <span className="report-card-value">{estSalePriceCardValue}</span>
                                <span className="report-card-description" dangerouslySetInnerHTML={{ __html: estSalePriceCardDescription }}></span>
                            </div>
                             <div className="report-card">
                                <span className="report-card-title">Strategy ROI</span>
                                <span className="report-card-value">{formatPercentageForReport(resaleStrategyAtYear5.strategyRoiPercent)}</span>
                                <span className="report-card-description">Total return on investment (incl. relevant additional costs) after 5 years operations & net resale</span>
                            </div>
                             <div className={`report-card ${resaleStrategyAtYear5.finalCumulativeCashFlowIncludingResale !== null && resaleStrategyAtYear5.finalCumulativeCashFlowIncludingResale > 0 ? 'report-card-profit' : (resaleStrategyAtYear5.finalCumulativeCashFlowIncludingResale !== null && resaleStrategyAtYear5.finalCumulativeCashFlowIncludingResale < 0 ? 'report-card-cost' : '')}`}>
                                <span className="report-card-title">Strategy net profit</span>
                                <span className="report-card-value">{formatCurrencyForReport(resaleStrategyAtYear5.finalCumulativeCashFlowIncludingResale)}</span>
                                <span className="report-card-description">Total net profit of this 5-year strategy, after all costs & net resale.</span>
                            </div>
                        </div>
                    </div>
                </>
            ) : inputs.enableResaleStrategy && inputs.leaseYears < 5 && resaleStrategyAtYear5 === null ? (
                <div className="report-content-section">
                    <h3>Alternative Strategy: Operate for 5 Years and Sell</h3>
                    <p>This strategy is not applicable as the lease term ({inputs.leaseYears} years) is less than 5 years.</p>
                </div>
            ) : !inputs.enableResaleStrategy ? (
                <div className="report-content-section">
                    <h3>Alternative Strategy: Operate for 5 Years and Sell</h3>
                    <p>This strategy is currently disabled in the input settings.</p>
                </div>
            ) : null}
            <footer className="report-page-footer">Page 3/{totalPages}</footer>
        </section>

        {/* Page 4: Scenario Input Parameters */}
        <section className="report-page">
            <h2>Scenario Input Parameters</h2>
            <p>The following parameters are the core assumptions used to generate all financial projections in this report. Understanding these inputs is crucial to interpreting the results.</p>
            
            <h3>Core Property & Operational Assumptions</h3>
            <div className="report-parameters-grid">
                <ScenarioParameter label="Property Price:" value={formatCurrencyForReport(inputs.propertyPrice)} />
                <ScenarioParameter label="Lease Years:" value={`${inputs.leaseYears} Years`} />
                <ScenarioParameter label="Daily Rate (High):" value={formatCurrencyForReport(inputs.dailyRateHigh)} />
                <ScenarioParameter label="Daily Rate (Low):" value={formatCurrencyForReport(inputs.dailyRateLow)} />
                <ScenarioParameter label="Occupancy (High):" value={formatPercentageForReport(inputs.occupancyRateHigh)} />
                <ScenarioParameter label="Occupancy (Low):" value={formatPercentageForReport(inputs.occupancyRateLow)} />
                <ScenarioParameter label="Management Fee:" value={formatPercentageForReport(inputs.managementFeePercent)} />
                <ScenarioParameter label="Utilities & Maint.:" value={formatPercentageForReport(inputs.utilitiesMaintenancePercent)} />
                <ScenarioParameter label="Taxes:" value={formatPercentageForReport(inputs.taxesPercent)} />
                <ScenarioParameter label="OTA Fees:" value={formatPercentageForReport(inputs.otaFeesPercent)} />
            </div>

             <h3>Additional Costs / Capital Expenditures</h3>
            <div className="report-parameters-grid">
                <ScenarioParameter 
                    label="Additional Costs / CapEx Enabled:" 
                    value={inputs.enableAdditionalCosts ? "Active" : "Inactive"}
                    valueClass={inputs.enableAdditionalCosts ? "active" : "inactive"}
                />
                {inputs.enableAdditionalCosts && inputs.additionalCosts.length > 0 && (
                    <>
                        {inputs.additionalCosts.map((cost, index) => (
                            <React.Fragment key={`addcost-param-${index}`}>
                                <ScenarioParameter 
                                    label={`Cost ${index + 1} Description:`} 
                                    value={cost.description || `Cost Event ${index+1}`} 
                                />
                                <ScenarioParameter label={`Cost ${index + 1} Year:`} value={cost.year.toString()} />
                                <ScenarioParameter 
                                    label={`Cost ${index + 1} Amount:`} 
                                    value={cost.costInputMode === 'percent' ? `${formatPercentageForReport(cost.costPercentOfPropertyPrice)} of Prop. Price` : `${formatCurrencyForReport(cost.costFixedAmount)} (Fixed)`}
                                />
                            </React.Fragment>
                        ))}
                    </>
                )}
                 {inputs.enableAdditionalCosts && inputs.additionalCosts.length === 0 && (
                     <ScenarioParameter label="Cost/Expenditure Events:" value="None Added" />
                 )}
            </div>

            <h3>5-Year Resale Strategy</h3>
            <div className="report-parameters-grid">
                <ScenarioParameter 
                    label="5-Year Resale Strategy:" 
                    value={inputs.enableResaleStrategy ? "Active" : "Inactive"}
                    valueClass={inputs.enableResaleStrategy ? "active" : "inactive"}
                />
                {inputs.enableResaleStrategy && (
                    <>
                        <ScenarioParameter label="Resale Profit Multiplier:" value={`${inputs.resaleProfitMultiplier}x Avg. 5-Yr Net Profit`} />
                        <ScenarioParameter 
                            label={`Sale Tax on Resale (${formatPercentageForReport(inputs.saleTaxRateOnResale, 0)}):`}
                            value={inputs.applySaleTaxOnResale ? `Active (${formatPercentageForReport(inputs.saleTaxRateOnResale,0)})` : "Inactive"}
                            valueClass={inputs.applySaleTaxOnResale ? "active" : "inactive"}
                        />
                        <ScenarioParameter 
                            label={`Agency Comm. on Resale (${formatPercentageForReport(inputs.agencyCommissionRateOnResale,0)}):`}
                            value={inputs.applyAgencyCommissionOnResale ? `Active (${formatPercentageForReport(inputs.agencyCommissionRateOnResale,0)})` : "Inactive"}
                            valueClass={inputs.applyAgencyCommissionOnResale ? "active" : "inactive"}
                        />
                    </>
                )}
            </div>
            
            <h3>Growth & Market Dynamics</h3>
            <div className="report-parameters-grid">
                <ScenarioParameter 
                    label="Annual Inflation:" 
                    value={inputs.applyInflation ? `Active (${formatPercentageForReport(inputs.inflationRate)})` : "Inactive"}
                    valueClass={inputs.applyInflation ? "active" : "inactive"}
                />
                <ScenarioParameter 
                    label="Occupancy Fluctuation:" 
                    value={inputs.fluctuateOccupancy ? "Active (Rate +/-10%)" : "Inactive"}
                    valueClass={inputs.fluctuateOccupancy ? "active" : "inactive"}
                />
                <ScenarioParameter 
                    label="Growth Policy:" 
                    value={inputs.applyGrowthDestabilization ? "Active (Market Dynamics Simulation)" : "Inactive"}
                    valueClass={inputs.applyGrowthDestabilization ? "active" : "inactive"}
                />
                {inputs.applyGrowthDestabilization && (
                    <>
                        <ScenarioParameter label="1st Year Revenue Penalty:" value={formatPercentageForReport(inputs.firstYearRevenuePenalty)} />
                        <ScenarioParameter label="Annual Base Growth Trend:" value={formatPercentageForReport(inputs.annualBaseGrowthTrend)} />
                        <ScenarioParameter label="Max Random Fluctuation (Annual):" value={formatPercentageForReport(inputs.annualRandomFluctuationMax)} />
                    </>
                )}
            </div>
            <footer className="report-page-footer">Page 4/{totalPages}</footer>
        </section>

        {/* Page 5: Parameter Explanations */}
        <section className="report-page">
            <h2>Parameter Explanations</h2>
            <div className="report-explanations">
                <ul>
                    {inputs.applyGrowthDestabilization && (
                        <li>
                            <strong>Growth Policy / Market Dynamics: Active</strong>
                            <p>Simulates realistic revenue growth with an 'S-curve' for new ventures and ongoing market fluctuations. This is important because it models a more realistic, non-linear path to profitability.</p>
                            <p className="explanation-detail">1st Year Revenue Penalty ({formatPercentageForReport(inputs.firstYearRevenuePenalty)}): A temporary reduction to simulate the initial "ramp-up" period where a new rental property builds its reputation and clientele.</p>
                            <p className="explanation-detail">Annual Base Growth Trend ({formatPercentageForReport(inputs.annualBaseGrowthTrend)}): The underlying growth rate after stabilization, reflecting long-term market appreciation and demand.</p>
                            <p className="explanation-detail">Max Random Fluctuation (Up to {formatPercentageForReport(inputs.annualRandomFluctuationMax)}): Accounts for the unpredictable nature of the market, introducing variability to make projections more robust and less idealized.</p>
                        </li>
                    )}
                    {inputs.applyInflation && (
                        <li>
                            <strong>Annual Inflation: Active ({formatPercentageForReport(inputs.inflationRate)})</strong>
                            <p>Reflects general price increases in the economy. This is applied annually to the daily rental rates, ensuring the projected income keeps pace with inflation over the long term.</p>
                        </li>
                    )}
                    {inputs.fluctuateOccupancy && (
                         <li>
                            <strong>Occupancy Fluctuation: Active (+/- 10%)</strong>
                            <p>Simulates minor, random variations in annual occupancy rates. This acknowledges that demand is not perfectly stable year-to-year and can be affected by small-scale factors, making the revenue forecast more realistic.</p>
                        </li>
                    )}
                    {(!inputs.applyGrowthDestabilization && !inputs.applyInflation && !inputs.fluctuateOccupancy) && (
                        <li><p>No advanced dynamic parameters (Growth Policy, Inflation, Occupancy Fluctuation) are currently active for this scenario.</p></li>
                    )}
                </ul>
            </div>
            
            <div className="report-disclaimer-box">
                <strong>Important Considerations & Next Steps</strong>
                <p>Financial projections by {REPORT_APP_NAME} use inputs from market analysis and advisor experience. Real-world performance can be influenced by factors not explicitly modeled (location, management, economic changes, etc.). This report aims for a realistic, slightly pessimistic view to support critical decision-making.</p>
                <p>It serves as an analytical tool. Bali's market requires due diligence. Discuss these projections with your {REPORT_APP_NAME} agent for tailored advice on your investment goals. We are here to help you make a well-informed decision.</p>
            </div>
            <footer className="report-page-footer">Page 5/{totalPages}</footer>
        </section>

        {/* Page 6: Additional Costs / Capital Expenditures Impact Analysis (Conditional) */}
        {showAdditionalCostsPage && (
            <section className="report-page">
                <h2>Additional Costs / Capital Expenditures Impact Analysis</h2>
                <div className="report-content-section">
                    <p>{additionalCostsPageExplanation}</p>
                </div>

                <div className="report-content-section">
                    <h3>Summary of Additional Costs / Expenditures</h3>
                     <div className="report-card-grid-3">
                        <div className="report-card">
                            <span className="report-card-title">Total Additional Costs</span>
                            <span className="report-card-value">{formatCurrencyForReport(totalAdditionalCosts)}</span>
                            <span className="report-card-description">Sum of all planned additional cost/expenditure events.</span>
                        </div>
                        <div className="report-card">
                            <span className="report-card-title">Total Capital Invested</span>
                            <span className="report-card-value">{formatCurrencyForReport(inputs.propertyPrice + totalAdditionalCosts)}</span>
                            <span className="report-card-description">Initial property price plus total additional costs/expenditures.</span>
                        </div>
                        <div className="report-card">
                            <span className="report-card-title">Planned Cost/Exp. Events</span>
                            <span className="report-card-value">{inputs.additionalCosts.length}</span>
                            <span className="report-card-description">Number of separate cost/expenditure events planned.</span>
                        </div>
                    </div>
                </div>
                
                <div className="report-content-section">
                    <h3>Detailed Cost / Expenditure Events</h3>
                    {additionalCostImpactDetails.length > 0 ? (
                        <div className="report-table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Year</th>
                                        <th>Description</th>
                                        <th>Cost (USD)</th>
                                        <th>Op. Net Profit (Prior Year)</th>
                                        <th>Covered by Prior Year's Profit?</th>
                                        <th>Op. Net Profit (Cost Year)</th>
                                        <th>Net Cash Flow (After Cost)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {additionalCostImpactDetails.map((detail, index) => (
                                        <tr key={`addcost-detail-${index}`}>
                                            <td>{detail.year}</td>
                                            <td>{detail.description || '-'}</td>
                                            <td className="report-text-negative">{formatCurrencyForReport(detail.cost)}</td>
                                            <td>{detail.operationalNetProfitYearPrior !== null ? formatCurrencyForReport(detail.operationalNetProfitYearPrior) : 'N/A (Year 1)'}</td>
                                            <td>{detail.coveredByPriorYearProfit === null ? 'N/A' : (detail.coveredByPriorYearProfit ? <span className="report-text-positive">Yes</span> : <span className="report-text-negative">No</span>)}</td>
                                            <td className={detail.operationalNetProfitYearOf !==null && detail.operationalNetProfitYearOf >=0 ? 'report-text-positive' : 'report-text-negative'}>{formatCurrencyForReport(detail.operationalNetProfitYearOf)}</td>
                                            <td className={detail.cumulativeCashFlowAfterCostInYear >= 0 ? 'report-text-positive' : 'report-text-negative'}>{formatCurrencyForReport(detail.cumulativeCashFlowAfterCostInYear)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>No specific cost/expenditure events to detail.</p>
                    )}
                </div>

                <div className="report-content-section">
                    <h3>Cumulative Cash Flow (Including Additional Costs / Expenditures)</h3>
                    <p className="sub-heading">This chart illustrates the main strategy's cash flow, including the impact of all planned additional costs/expenditures.</p>
                    <div className="report-chart-container">
                        <CashflowChart 
                            data={yearlyProjections} 
                            propertyPrice={inputs.propertyPrice} 
                            paybackPeriodInYears={paybackPeriodInYears}
                            isForPdf={false} 
                        />
                    </div>
                </div>
                 <footer className="report-page-footer">Page 6/{totalPages}</footer>
            </section>
        )}
      </main>
    </div>
  );
};

export default ReportView;
