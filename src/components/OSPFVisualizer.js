import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Network, Target, Router, X } from "lucide-react";
import '../App.css'

const OSPFVisualizer = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [newNodeName, setNewNodeName] = useState("");
  const [edgeWeight, setEdgeWeight] = useState("");
  const [shortestPath, setShortestPath] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const [draggedNode, setDraggedNode] = useState(null);
  const svgRef = useRef(null);
  const [highlightedEdges, setHighlightedEdges] = useState([]);
  const [shortestPathNodes, setShortestPathNodes] = useState([]);
  // Initialize canvas dimensions based on window size
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const svg = svgRef.current;
        svg.setAttribute("width", window.innerWidth * 0.8);
        svg.setAttribute("height", window.innerHeight * 0.8);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call once to set initial size

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //For mobile deviices

  const handleTouchStart = (e, nodeId) => {
    const touch = e.touches[0];
    if (touch) {
      setDraggedNode(nodeId);
      e.stopPropagation();
    }
  };
  
  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    if (!draggedNode || !svgRef.current || !touch) return;
  
    const svg = svgRef.current;
    const svgRect = svg.getBoundingClientRect();
    const x = touch.clientX - svgRect.left;
    const y = touch.clientY - svgRect.top;
  
    // Update node position
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === draggedNode
          ? {
              ...node,
              x: Math.max(20, Math.min(svgRect.width - 20, x)),
              y: Math.max(20, Math.min(svgRect.height - 20, y)),
            }
          : node
      )
    );
  };
  
  const handleTouchEnd = () => {
    setDraggedNode(null);
  };

  const handleDragStart = (e, nodeId) => {
    setDraggedNode(nodeId);
    e.stopPropagation(); // Prevent node selection when starting to drag
  };

  const handleDrag = (e) => {
    if (!draggedNode || !svgRef.current) return;

    const svg = svgRef.current;
    const svgRect = svg.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;

    // Update node position
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === draggedNode
          ? {
              ...node,
              x: Math.max(20, Math.min(svgRect.width - 20, x)),
              y: Math.max(20, Math.min(svgRect.height - 20, y)),
            }
          : node
      )
    );
  };

  const handleDragEnd = () => {
    setDraggedNode(null);
  };

  // Dijkstra's Algorithm Implementation
  const findShortestPath = (start, end) => {
    const distances = {};
    const previous = {};
    const unvisited = new Set();

    nodes.forEach((node) => {
      distances[node.id] = Infinity;
      previous[node.id] = null;
      unvisited.add(node.id);
    });
    distances[start] = 0;

    while (unvisited.size > 0) {
      let current = null;
      let minDistance = Infinity;
      unvisited.forEach((nodeId) => {
        if (distances[nodeId] < minDistance) {
          minDistance = distances[nodeId];
          current = nodeId;
        }
      });

      if (current === end) break;
      if (current === null) break; // No path found

      unvisited.delete(current);

      edges.forEach((edge) => {
        if (edge.source === current || edge.target === current) {
          const neighbor = edge.source === current ? edge.target : edge.source;
          const newDistance = distances[current] + edge.weight;

          if (newDistance < distances[neighbor]) {
            distances[neighbor] = newDistance;
            previous[neighbor] = current;
          }
        }
      });
    }

    const path = [];
    let current = end;
    while (current !== null) {
      path.unshift(current);
      current = previous[current];
    }

    setTotalCost(distances[end]);
    return path.length > 1 ? path : null;
  };

  const addNode = () => {
    if (newNodeName.trim() && svgRef.current) {
      const svg = svgRef.current;
      const svgRect = svg.getBoundingClientRect();

      const newNode = {
        id: `node${nodes.length}`,
        name: newNodeName.trim(),
        x: Math.random() * (svgRect.width - 50) + 25, // Ensure within bounds
        y: Math.random() * (svgRect.height - 50) + 25, // Ensure within bounds
      };

      setNodes((prevNodes) => [...prevNodes, newNode]);
      setNewNodeName("");
    }
  };

  const addEdge = () => {
    if (selectedNodes.length === 2 && edgeWeight) {
      const weight = parseInt(edgeWeight);
      if (!isNaN(weight) && weight > 0) {
        const newEdge = {
          source: selectedNodes[0],
          target: selectedNodes[1],
          weight: weight,
        };
        setEdges((prevEdges) => [...prevEdges, newEdge]);
        setSelectedNodes([]);
        setEdgeWeight("");
      }
    }
  };

  const toggleNodeSelection = (nodeId) => {
    if (!draggedNode) {
      if (selectedNodes.includes(nodeId)) {
        setSelectedNodes((prev) => prev.filter((id) => id !== nodeId));
      } else if (selectedNodes.length < 2) {
        setSelectedNodes((prev) => [...prev, nodeId]);
      }
    }
  };

  const removeNode = (nodeId) => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId));
    setEdges((prevEdges) =>
      prevEdges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      )
    );
    setSelectedNodes((prev) => prev.filter((id) => id !== nodeId));
    setShortestPath(null);
  };

  const calculateShortestPath = () => {
    if (selectedNodes.length === 2) {
      const path = findShortestPath(selectedNodes[0], selectedNodes[1]);
      setShortestPath(path);

      // Identify highlighted edges based on the shortest path
      const edgesToHighlight = [];
      const nodesInPath = [];

      if (path) {
        for (let i = 0; i < path.length - 1; i++) {
          const edge = edges.find(
            (e) =>
              (e.source === path[i] && e.target === path[i + 1]) ||
              (e.source === path[i + 1] && e.target === path[i])
          );
          if (edge) {
            edgesToHighlight.push(edge);
            // Add nodes to the path for displaying names
            if (!nodesInPath.includes(path[i])) {
              nodesInPath.push(path[i]);
            }
          }
        }
      }
      setHighlightedEdges(edgesToHighlight);
      setShortestPathNodes(nodesInPath);
    }
  };

  return (
    <div className="container">
      <Card>
        <CardHeader className="headingtext">
          <CardTitle  className="cardtitle" style={{ color: "white" }}>Network Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="controls">
            <div className="input-group">
              <Input
                value={newNodeName}
                onChange={(e) => setNewNodeName(e.target.value)}
                placeholder="Enter device name"
              />
              <Button onClick={addNode}>
                <Router className="icon w-4 h-4 mr-2" />
                Add Device
              </Button>
            </div>

            <div className="input-group">
              <Input
                value={edgeWeight}
                onChange={(e) => setEdgeWeight(e.target.value)}
                placeholder="Enter bandwidth/cost"
                type="number"
                disabled={selectedNodes.length !== 2}
              />
              <Button
                onClick={addEdge}
                disabled={selectedNodes.length !== 2 || !edgeWeight}
              >
                <Network className="icon w-4 h-4 mr-2" />
                Add Connection
              </Button>

              `  <Button
                  onClick={calculateShortestPath}
                  disabled={selectedNodes.length !== 2}
                >
                  <Target className="icon w-4 h-4 mr-2" />
                  Find Path
                </Button>`
              <Button
                onClick={() => removeNode(selectedNodes[0])}
                disabled={selectedNodes.length === 0}
              >
                <X className="icon w-4 h-4 mr-2" />
                Remove Device
              </Button>
            </div>

            {shortestPath && (
              <div className="shortest-path-container">
                <h3>
                  Shortest Path:{" "}
                  {shortestPath.map((nodeId) => {
                    const node = nodes.find((n) => n.id === nodeId);
                    return node ? node.name : nodeId;
                  }).join(" -> ")}
                </h3>
                <h4>Total Cost: {totalCost}</h4>
              </div>
            )}
          </div>
          <svg
            id="svgCanvas"
            ref={svgRef}
            onMouseMove={handleDrag}
            onMouseUp={handleDragEnd}
            onTouchMove={handleTouchMove} // Touch equivalent of mouse move
            onTouchEnd={handleTouchEnd} // Touch equivalent of mouse up
          >
            {edges.map((edge, index) => {
              const sourceNode = nodes.find((node) => node.id === edge.source);
              const targetNode = nodes.find((node) => node.id === edge.target);

              const midX = (sourceNode.x + targetNode.x) / 2;
              const midY = (sourceNode.y + targetNode.y) / 2;

              const isHighlighted = highlightedEdges.some(
                (highlightedEdge) =>
                  (highlightedEdge.source === edge.source &&
                    highlightedEdge.target === edge.target) ||
                  (highlightedEdge.source === edge.target &&
                    highlightedEdge.target === edge.source)
              );

              return (
                <g key={index}>
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    className={isHighlighted ? "highlighted-edge" : "edge-line"}
                  />
                  <text
                    x={midX}
                    y={midY}
                    className="edge-weight-text"
                    dominantBaseline="middle"
                    textAnchor="middle"
                  >
                    {edge.weight}
                  </text>

                  {isHighlighted && (
                    <>
                      <text
                        x={sourceNode.x}
                        y={sourceNode.y - 10}
                        className="highlighted-node-name"
                        dominantBaseline="middle"
                        textAnchor="middle"
                      >
                        {sourceNode.name}
                      </text>
                      <text
                        x={targetNode.x}
                        y={targetNode.y + 10}
                        className="highlighted-node-name"
                        dominantBaseline="middle"
                        textAnchor="middle"
                      >
                        {targetNode.name}
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {nodes.map((node) => (
              <g
                key={node.id}
                onMouseDown={(e) => handleDragStart(e, node.id)}
                onMouseUp={handleDragEnd}
                onClick={() => toggleNodeSelection(node.id)}
                onTouchStart={(e) => handleTouchStart(e, node.id)} // Handle touch start
                onTouchEnd={handleTouchEnd} // Handle touch end
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={20}
                  className={`node-circle ${selectedNodes.includes(node.id) ? "selected-node" : "default-node"}`}
                />
                <text
                  x={node.x}
                  y={node.y}
                  className="node-text"
                  dominantBaseline="middle"
                  textAnchor="middle"
                >
                  {node.name}
                </text>
              </g>
            ))}
          </svg>
        </CardContent>
      </Card>
    </div>
  );
};

export default OSPFVisualizer;