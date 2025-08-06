// export default FileTreeVisualizationWithErrorBoundary;
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  Component,
  ErrorInfo,
  ReactNode,
} from "react";
import * as d3 from "d3";
import {
  Folder,
  File,
  FolderOpen,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class FileTreeErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("FileTreeVisualization Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg border border-gray-700">
          <div className="text-center text-gray-400 p-6">
            <div className="text-2xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Visualization Error</h3>
            <p className="text-sm mb-4">
              There was an error loading the file tree visualization.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface FileNode {
  name: string;
  type: "file" | "folder";
  path?: string;
  download_url?: string;
  children?: FileNode[];
  depth?: number;
  truncated?: boolean;
  message?: string;
  size?: number;
}

interface FileTreeVisualizationProps {
  data: FileNode;
  onFileSelect: (file: FileNode) => void;
}

interface D3Node extends d3.HierarchyNode<FileNode> {
  _children?: D3Node[];
  x0?: number;
  y0?: number;
}

const FileTreeVisualization: React.FC<FileTreeVisualizationProps> = ({
  data,
  onFileSelect,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const treeDataRef = useRef<D3Node | null>(null);
  const isInitializedRef = useRef(false);

  // Zoom state
  const [zoomLevel, setZoomLevel] = useState();
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Calculate repository statistics
  const repoStats = useMemo(() => {
    const stats = {
      totalFiles: 0,
      totalFolders: 0,
      maxDepth: 0,
      totalSize: 0,
      truncatedFolders: 0,
    };

    const traverse = (node: FileNode, depth: number = 0) => {
      stats.maxDepth = Math.max(stats.maxDepth, depth);

      if (node.type === "file") {
        stats.totalFiles++;
        if (node.size) {
          stats.totalSize += node.size;
        }
      } else if (node.type === "folder") {
        stats.totalFolders++;
        if (node.truncated) {
          stats.truncatedFolders++;
        }
        if (node.children) {
          node.children.forEach((child) => traverse(child, depth + 1));
        }
      }
    };

    traverse(data);
    return stats;
  }, [data]);

  // Memoize the data to prevent unnecessary re-renders
  const memoizedData = useMemo(() => data, [data]);

  // Memoize the callback to prevent re-renders
  const memoizedOnFileSelect = useMemo(() => onFileSelect, [onFileSelect]);

  // Force re-render for slider updates
  const updateSliderValues = () => {
    setForceUpdate((prev) => prev + 1);
  };

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const isMobile = window.innerWidth < 768;
        const baseWidth = containerRef.current.clientWidth;
        const baseHeight = isMobile
          ? Math.max(400, window.innerHeight * 0.5)
          : Math.max(500, window.innerHeight * 0.6);

        setDimensions({
          width: baseWidth,
          height: baseHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!memoizedData || !svgRef.current) return;

    // Only reinitialize if data actually changes (reference comparison)
    if (treeDataRef.current && treeDataRef.current.data === memoizedData) {
      return;
    }

    try {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      // Responsive margins based on screen size
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

      const margin = isMobile
        ? { top: 15, right: 70, bottom: 15, left: 70 }
        : isTablet
        ? { top: 20, right: 100, bottom: 20, left: 100 }
        : { top: 25, right: 130, bottom: 25, left: 130 };

      const width = dimensions.width - margin.left - margin.right;
      const height = dimensions.height - margin.top - margin.bottom;

      // Create zoom behavior
      const zoom = d3
        .zoom()
        .scaleExtent([0.1, 3])
        .on("zoom", (event) => {
          const { transform } = event;
          setZoomLevel(transform.k);
          setPanX(transform.x);
          setPanY(transform.y);

          g.attr("transform", transform);

          // Update sliders if controls are visible
          if (showControls) {
            updateSliderValues();
          }
        });

      svg.call(zoom as any);

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const tree = d3.tree<FileNode>().size([height, width]);
      const root = d3.hierarchy(memoizedData) as D3Node;

      root.x0 = height / 2;
      root.y0 = 0;

      // Collapse nodes initially (except root)
      const collapse = (d: D3Node) => {
        if (d.children) {
          d._children = d.children;
          d._children.forEach(collapse);
          d.children = undefined;
        }
      };

      if (root.children) {
        root.children.forEach(collapse);
      }

      treeDataRef.current = root;
      isInitializedRef.current = true;

      let i = 0;

      const update = (source: D3Node) => {
        try {
          const treeData = tree(root);
          const nodes = treeData.descendants();
          const links = treeData.descendants().slice(1);

          // Responsive node spacing
          const nodeSpacing = isMobile ? 160 : isTablet ? 180 : 200;

          // Normalize for fixed-depth
          nodes.forEach((d) => {
            d.y = d.depth * nodeSpacing;
          });

          // Update nodes
          const node = g
            .selectAll("g.node")
            .data(nodes, (d: any) => d.id || (d.id = ++i));

          const nodeEnter = node
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", () => `translate(${source.y0},${source.x0})`)
            .on("click", (event, d: D3Node) => {
              event.stopPropagation();
              event.preventDefault();

              try {
                if (d.data.type === "folder") {
                  if (d.children) {
                    d._children = d.children;
                    d.children = undefined;
                  } else {
                    d.children = d._children;
                    d._children = undefined;
                  }
                  update(d);
                } else {
                  memoizedOnFileSelect(d.data);
                }
              } catch (error) {
                console.error("Error handling node click:", error);
              }
            });

          nodeEnter
            .append("circle")
            .attr("class", "node-circle")
            .attr("r", 1e-6)
            .style("fill", (d: D3Node) => {
              if (d.data.type === "folder") {
                return d._children ? "#4F46E5" : "#10B981";
              }
              return "#EF4444";
            })
            .style("cursor", "default");

          nodeEnter
            .append("text")
            .attr("dy", ".35em")
            .attr("x", (d: D3Node) => (d.children || d._children ? -13 : 13))
            .attr("text-anchor", (d: D3Node) =>
              d.children || d._children ? "end" : "start"
            )
            .text((d: D3Node) => d.data.name)
            .style("fill", "#E5E7EB")
            .style("font-size", isMobile ? "12px" : "14px")
            .style("cursor", "default")
            .style("opacity", 1e-6);

          const nodeUpdate = nodeEnter.merge(node as any);

          nodeUpdate
            .transition()
            .duration(750)
            .attr("transform", (d: D3Node) => `translate(${d.y},${d.x})`);

          nodeUpdate
            .select("circle.node-circle")
            .attr("r", isMobile ? 6 : 8)
            .style("fill", (d: D3Node) => {
              if (d.data.type === "folder") {
                return d._children ? "#4F46E5" : "#10B981";
              }
              return "#EF4444";
            })
            .style("cursor", "default");

          nodeUpdate.select("text").style("opacity", 1);

          const nodeExit = node
            .exit()
            .transition()
            .duration(750)
            .attr("transform", () => `translate(${source.y},${source.x})`)
            .remove();

          nodeExit.select("circle").attr("r", 1e-6);

          nodeExit.select("text").style("opacity", 1e-6);

          // Update links
          const link = g.selectAll("path.link").data(links, (d: any) => d.id);

          const linkEnter = link
            .enter()
            .insert("path", "g")
            .attr("class", "link")
            .attr("d", () => {
              const o = { x: source.x0, y: source.y0 };
              return diagonal(o, o);
            })
            .style("fill", "none")
            .style("stroke", "#374151")
            .style("stroke-width", isMobile ? "1.5px" : "2px");

          const linkUpdate = linkEnter.merge(link as any);

          linkUpdate
            .transition()
            .duration(750)
            .attr("d", (d: any) => diagonal(d, d.parent));

          link
            .exit()
            .transition()
            .duration(750)
            .attr("d", () => {
              const o = { x: source.x, y: source.y };
              return diagonal(o, o);
            })
            .remove();

          nodes.forEach((d: D3Node) => {
            d.x0 = d.x!;
            d.y0 = d.y!;
          });
        } catch (error) {
          console.error("Error in tree update:", error);
        }
      };

      const diagonal = (s: any, d: any) => {
        return `M ${s.y} ${s.x}
                C ${(s.y + d.y) / 2} ${s.x},
                  ${(s.y + d.y) / 2} ${d.x},
                  ${d.y} ${d.x}`;
      };

      update(root);
    } catch (error) {
      console.error("Error initializing tree visualization:", error);
    }
  }, [memoizedData, dimensions, memoizedOnFileSelect, showControls]);

  // Zoom controls
  const handleZoomIn = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const newZoom = Math.min(zoomLevel * 1.2, 3);
      svg
        .transition()
        .duration(300)
        .call(d3.zoom().scaleTo as any, newZoom);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const newZoom = Math.max(zoomLevel / 1.2, 0.1);
      svg
        .transition()
        .duration(300)
        .call(d3.zoom().scaleTo as any, newZoom);
    }
  };

  const handleReset = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg
        .transition()
        .duration(300)
        .call(d3.zoom().transform as any, d3.zoomIdentity);
    }
  };

  // Pan controls
  const handlePanChange = (
    direction: "horizontal" | "vertical",
    value: number
  ) => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const transform = d3.zoomTransform(svgRef.current);

      if (direction === "horizontal") {
        const newTransform = transform.translate(value - transform.x, 0);
        svg
          .transition()
          .duration(200)
          .call(d3.zoom().transform as any, newTransform);
      } else {
        const newTransform = transform.translate(0, value - transform.y);
        svg
          .transition()
          .duration(200)
          .call(d3.zoom().transform as any, newTransform);
      }
    }
  };

  // Get current pan values for sliders
  const getCurrentPanX = () => {
    if (svgRef.current) {
      return d3.zoomTransform(svgRef.current).x;
    }
    return panX;
  };

  const getCurrentPanY = () => {
    if (svgRef.current) {
      return d3.zoomTransform(svgRef.current).y;
    }
    return panY;
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-300">
            Repository Structure
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowControls(!showControls)}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-all duration-200"
              title="Toggle controls"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-6 text-xs sm:text-sm text-gray-400">
          <div className="flex items-center whitespace-nowrap">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500 mr-1 sm:mr-2"></div>
            <span className="text-xs sm:text-sm">Expanded Folder</span>
          </div>
          <div className="flex items-center whitespace-nowrap">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-indigo-500 mr-1 sm:mr-2"></div>
            <span className="text-xs sm:text-sm">Collapsed Folder</span>
          </div>
          <div className="flex items-center whitespace-nowrap">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500 mr-1 sm:mr-2"></div>
            <span className="text-xs sm:text-sm">File</span>
          </div>
        </div>

        {/* Repository Statistics */}
        <div className="mt-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-white font-semibold">
                {repoStats.totalFiles}
              </div>
              <div className="text-gray-400 text-xs">Files</div>
            </div>
            <div className="text-center">
              <div className="text-white font-semibold">
                {repoStats.totalFolders}
              </div>
              <div className="text-gray-400 text-xs">Folders</div>
            </div>
            <div className="text-center">
              <div className="text-white font-semibold">
                {repoStats.maxDepth}
              </div>
              <div className="text-gray-400 text-xs">Max Depth</div>
            </div>
            <div className="text-center">
              <div className="text-white font-semibold">
                {repoStats.totalSize > 0
                  ? `${(repoStats.totalSize / 1024 / 1024).toFixed(1)} MB`
                  : "N/A"}
              </div>
              <div className="text-gray-400 text-xs">Total Size</div>
            </div>
          </div>
          {repoStats.truncatedFolders > 0 && (
            <div className="mt-2 text-center">
              <div className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-600/20 text-yellow-300 text-xs">
                <span className="mr-1">⚠️</span>
                {repoStats.truncatedFolders} folder
                {repoStats.truncatedFolders > 1 ? "s" : ""} truncated due to
                depth limit
              </div>
            </div>
          )}
        </div>

        {/* Zoom and Pan Controls */}
        {showControls && (
          <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Zoom Controls */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">
                  Zoom Controls
                </h4>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleZoomOut}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-all duration-200"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-gray-400 min-w-[60px] text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-all duration-200"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-all duration-200"
                    title="Reset View"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Pan Controls */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">
                  Pan Controls
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400 w-8">H:</span>
                    <input
                      type="range"
                      min="-1000"
                      max="1000"
                      value={getCurrentPanX()}
                      onChange={(e) =>
                        handlePanChange("horizontal", parseInt(e.target.value))
                      }
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-xs text-gray-400 w-12 text-right">
                      {Math.round(getCurrentPanX())}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400 w-8">V:</span>
                    <input
                      type="range"
                      min="-1000"
                      max="1000"
                      value={getCurrentPanY()}
                      onChange={(e) =>
                        handlePanChange("vertical", parseInt(e.target.value))
                      }
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-xs text-gray-400 w-12 text-right">
                      {Math.round(getCurrentPanY())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className="bg-gray-800 rounded-lg p-2 sm:p-4 flex-1 overflow-hidden min-h-0 border border-gray-700 scrollbar-thin relative"
        style={{ minHeight: "400px" }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="min-h-64 sm:min-h-96 cursor-grab active:cursor-grabbing"
        />

        {/* Zoom Instructions */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-gray-900/80 px-2 py-1 rounded">
          Scroll to zoom • Drag to pan
        </div>
      </div>
    </div>
  );
};

// Export with error boundary
const FileTreeVisualizationWithErrorBoundary: React.FC<
  FileTreeVisualizationProps
> = (props) => {
  return (
    <FileTreeErrorBoundary>
      <FileTreeVisualization {...props} />
    </FileTreeErrorBoundary>
  );
};

export default FileTreeVisualizationWithErrorBoundary;
