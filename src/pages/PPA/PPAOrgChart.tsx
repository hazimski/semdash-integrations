import React, { useState, useRef, useEffect } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { ExternalLink, ZoomIn, ZoomOut } from 'lucide-react';

interface ExpandedElement {
  description: string;
  url: string;
  title: string;
  domain: string;
}

interface PPAItem {
  title: string;
  seed_question: string | null;
  expanded_element: ExpandedElement[];
}

interface PPAOrgChartProps {
  data: PPAItem[];
  rootKeyword: string;
  isLoading: boolean;
  error: string | null;
  displayOptions: {
    showDescription: boolean;
    showDomain: boolean;
  };
}

const NodeComponent = ({ 
  title, 
  description,
  url,
  domain,
  displayOptions
}: { 
  title: string;
  description?: string;
  url?: string;
  domain?: string;
  displayOptions: {
    showDescription: boolean;
    showDomain: boolean;
  };
}) => (
  <div className="inline-block bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-w-[300px] max-w-[400px]">
    <h3 className="font-medium text-gray-900">{title}</h3>
    {displayOptions.showDescription && description && (
      <div className="mt-2 space-y-2">
        <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
        {displayOptions.showDomain && url && domain && (
          <a 
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            {domain}
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        )}
      </div>
    )}
  </div>
);

export function PPAOrgChart({ data, rootKeyword, isLoading, error, displayOptions }: PPAOrgChartProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate initial zoom level to fit content
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const content = container.querySelector('.organizational-chart') as HTMLElement;
      if (content) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const contentWidth = content.scrollWidth;
        const contentHeight = content.scrollHeight;

        const horizontalScale = containerWidth / contentWidth;
        const verticalScale = containerHeight / contentHeight;
        const initialZoom = Math.min(horizontalScale, verticalScale, 1) * 0.8;

        setZoomLevel(initialZoom);
        
        // Center the content
        setPosition({
          x: margin,
          y: (containerHeight - contentHeight * initialZoom) / 2
        });
      }
    }
  }, [data]);

  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel(prev => Math.min(Math.max(0.5, prev + delta), 2));
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPosition({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - startPosition.x,
        y: e.clientY - startPosition.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

if (error) {
  console.error('An error occurred in PPAOrgChart:', error); // Logs the error to the console for debugging.
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <p className="text-red-600">{error}</p>
    </div>
  );
}

  // Separate items into levels
  const level1Items = data.filter(item => !item.seed_question);
  const level2Items = data.filter(item => item.seed_question);

  const margin = 40;

  return (
    <div className="relative bg-white rounded-lg shadow overflow-hidden">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
        <div className="flex flex-col items-center space-y-2">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 2))}
            disabled={zoomLevel >= 2}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <div className="h-24 w-1 bg-gray-200 rounded-full relative">
            <input
              type="range"
              min="50"
              max="200"
              value={zoomLevel * 100}
              onChange={(e) => setZoomLevel(Number(e.target.value) / 100)}
              className="absolute w-24 h-1 -rotate-90 top-1/2 -translate-x-[42px] appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
            />
          </div>

          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))}
            disabled={zoomLevel <= 0.5}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Zoomable Container */}
      <div 
        ref={containerRef}
        className="relative h-[calc(100vh-300px)] overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
            transformOrigin: '0 0'
          }}
        >
          <div className="organizational-chart" style={{ display: 'flex', flexDirection: 'row' }}>
            <Tree
              lineWidth="2px"
              lineColor="#E5E7EB"
              lineBorderRadius="6px"
              label={
                <NodeComponent 
                  title={rootKeyword}
                  displayOptions={displayOptions}
                />
              }
              orientation="horizontal"
            >
              {level1Items.map((item, index) => {
                const relatedLevel2Items = level2Items.filter(
                  l2 => l2.seed_question === item.title
                );
                
                return (
                  <TreeNode 
                    key={index}
                    label={
                      <NodeComponent 
                        title={item.title}
                        description={item.expanded_element[0]?.description}
                        url={item.expanded_element[0]?.url}
                        domain={item.expanded_element[0]?.domain}
                        displayOptions={displayOptions}
                      />
                    }
                  >
                    {relatedLevel2Items.map((l2Item, l2Index) => (
                      <TreeNode
                        key={l2Index}
                        label={
                          <NodeComponent 
                            title={l2Item.title}
                            description={l2Item.expanded_element[0]?.description}
                            url={l2Item.expanded_element[0]?.url}
                            domain={l2Item.expanded_element[0]?.domain}
                            displayOptions={displayOptions}
                          />
                        }
                      />
                    ))}
                  </TreeNode>
                );
              })}
            </Tree>
          </div>
        </div>
      </div>

      <style>{`
        .organizational-chart {
          padding: ${margin}px;
        }
        .organizational-chart ul {
          display: flex !important;
          flex-direction: row !important;
          padding-left: 40px !important;
        }
        .organizational-chart li {
          padding: 0 20px !important;
        }
      `}</style>
    </div>
  );
}
