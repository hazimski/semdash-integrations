import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatNumber } from '../../utils/format';

interface MetricsBoxesProps {
  metrics: {
    domainRank: number;
    organicTraffic: number;
    keywords: number;
    backlinks: number;
    referringDomains: number;
    brokenPages: number;
    brokenBacklinks: number;
    ips: number;
    subnets: number;
  };
  domain: string;
  locationCode: string;
  languageCode: string;
}

export function MetricsBoxes({ metrics, domain, locationCode, languageCode }: MetricsBoxesProps) {
  const navigate = useNavigate();

  const handleKeywordsClick = () => {
    const searchParams = new URLSearchParams({
      domain,
      location: locationCode,
      language: languageCode
    });
    navigate(`/ranked-keywords/results?${searchParams.toString()}`);
  };

  const handleBacklinksClick = () => {
    const searchParams = new URLSearchParams({
      target: domain,
      includeSubdomains: 'true'
    });
    navigate(`/botox/results?${searchParams.toString()}`);
  };

  const handleBrokenBacklinksClick = () => {
    const searchParams = new URLSearchParams({
      target: domain,
      includeSubdomains: 'true',
      initialFilter: JSON.stringify({ type: 'broken' })
    });
    navigate(`/botox/results?${searchParams.toString()}`);
  };

  const handleReferringDomainsClick = () => {
    const searchParams = new URLSearchParams({
      target: domain,
      includeSubdomains: 'true'
    });
    navigate(`/referring-domains/results?${searchParams.toString()}`);
  };

  const handleBrokenPagesClick = () => {
    const searchParams = new URLSearchParams({
      domain,
      includeSubdomains: 'true',
      brokenPages: 'true',
      excludeQueryParams: 'true'
    });
    navigate(`/pages-by-links/results?${searchParams.toString()}`);
  };

  const boxes = [
    {
      label: 'Domain Rank',
      value: metrics.domainRank,
      onClick: undefined,
      className: ''
    },
    {
      label: 'Organic Traffic',
      value: formatNumber(metrics.organicTraffic),
      onClick: undefined,
      className: ''
    },
    {
      label: 'Keywords',
      value: formatNumber(metrics.keywords),
      onClick: handleKeywordsClick,
      className: 'hover:bg-gray-50 cursor-pointer'
    },
    {
      label: 'Backlinks',
      value: formatNumber(metrics.backlinks),
      onClick: handleBacklinksClick,
      className: 'hover:bg-gray-50 cursor-pointer'
    },
    {
      label: 'Referring Domains',
      value: formatNumber(metrics.referringDomains),
      onClick: handleReferringDomainsClick,
      className: 'hover:bg-gray-50 cursor-pointer'
    },
    {
      label: 'Broken Pages',
      value: formatNumber(metrics.brokenPages),
      onClick: handleBrokenPagesClick,
      className: 'hover:bg-gray-50 cursor-pointer'
    },
    {
      label: 'Broken Backlinks',
      value: formatNumber(metrics.brokenBacklinks),
      onClick: handleBrokenBacklinksClick,
      className: 'hover:bg-gray-50 cursor-pointer'
    },
    {
      label: 'IPs',
      value: formatNumber(metrics.ips),
      onClick: undefined,
      className: ''
    },
    {
      label: 'Subnets',
      value: formatNumber(metrics.subnets),
      onClick: undefined,
      className: ''
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="grid grid-cols-9 divide-x">
        {boxes.map((box, index) => (
          <div 
            key={index}
            className={`px-4 py-3 ${box.className} transition-colors`}
            onClick={box.onClick}
          >
            <div className="h-full flex flex-col justify-between min-h-[70px]">
              <p className="text-sm text-gray-600">{box.label}</p>
              <p className="text-lg font-semibold text-blue-500 mt-auto">
                {box.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}