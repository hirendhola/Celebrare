import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Bold,
  Underline,
  Italic,
  Trash,
  Undo,
  Redo,
  Type,
  Download,
} from "lucide-react";
import { HexColorPicker } from "react-colorful";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const TextEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [color, setColor] = useState("#000000");
  const fontSizes = Array.from({ length: 100 }, (_, i) => i + 1);
  const defaultColors = ["#FF5733", "#33FF57", "#3357FF", "#F5A623", "#B80000"];

  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      const newCanvas = new fabric.Canvas(canvasRef.current, {
        width: containerRef.current.offsetWidth,
        height: 400,
        backgroundColor: "#f0f0f0",
      });
      setCanvas(newCanvas);

      const handleResize = () => {
        if (containerRef.current) {
          const newWidth = containerRef.current.offsetWidth;
          const newHeight = 400;
          newCanvas.setDimensions({ width: newWidth, height: newHeight });
          newCanvas.renderAll();
        }
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        newCanvas.dispose();
      };
    }
  }, []);

  const addText = () => {
    if (canvas) {
      const text = new fabric.IText("🚀 Am I selected?", {
        left: 50 + Math.random() * (canvas.width! - 100),
        top: 50 + Math.random() * (canvas.height! - 100),
        fontFamily: "Arial",
        fill: color,
        fontSize: 20,
      });
      canvas.add(text);
      saveState();
    }
  };

  const toggleStyle = (style: "bold" | "italic" | "underline") => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.type === "i-text") {
        const textObject = activeObject as fabric.IText;
        switch (style) {
          case "bold":
            textObject.set(
              "fontWeight",
              textObject.fontWeight === "bold" ? "normal" : "bold"
            );
            break;
          case "italic":
            textObject.set(
              "fontStyle",
              textObject.fontStyle === "italic" ? "normal" : "italic"
            );
            break;
          case "underline":
            textObject.set("underline", !textObject.underline);
            break;
        }
        canvas.renderAll();
        saveState();
      }
    }
  };

  const changeFontSize = (fontSize: number) => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.type === "i-text") {
        const textObject = activeObject as fabric.IText;
        textObject.set("fontSize", fontSize);
        canvas.renderAll();
        saveState();
      }
    }
  };

  const changeFontFamily = (fontFamily: string) => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.type === "i-text") {
        const textObject = activeObject as fabric.IText;
        textObject.set("fontFamily", fontFamily);
        canvas.renderAll();
        saveState();
      }
    }
  };

  const changeColor = (newColor: string) => {
    setColor(newColor);
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.type === "i-text") {
        const textObject = activeObject as fabric.IText;
        textObject.set("fill", newColor);
        canvas.renderAll();
        saveState();
      }
    }
  };

  const removeText = () => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();

      if (activeObject) {
        if (activeObject.type === "activeSelection") {
          const activeSelection = activeObject as fabric.ActiveSelection;
          activeSelection.forEachObject((obj) => {
            canvas.remove(obj);
          });
          canvas.discardActiveObject();
        } else {
          canvas.remove(activeObject);
        }

        canvas.renderAll();
        saveState();
      }
    }
  };

  const saveState = () => {
    if (canvas) {
      const json = JSON.stringify(canvas);
      setHistory((prevHistory) => [
        ...prevHistory.slice(0, historyIndex + 1),
        json,
      ]);
      setHistoryIndex((prevIndex) => prevIndex + 1);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prevIndex) => prevIndex - 1);
      loadState(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prevIndex) => prevIndex + 1);
      loadState(historyIndex + 1);
    }
  };

  const loadState = (index: number) => {
    if (canvas && history[index]) {
      canvas.loadFromJSON(history[index], () => {
        canvas.renderAll();
      });
    }
  };

  const exportAsPNG = () => {
    if (canvas) {
      const dataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
      });
      const link = document.createElement("a");
      link.download = `canvas-export-${Math.round(Math.random() * 100000)}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-screen flex flex-col items-center min-h-screen bg-gray-100 p-4 overflow-x-hidden">
      <div className="w-full h-fit max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden ">
        <div className="flex justify-between items-center p-4 border-b h-full ">
          <h1 className="text-2xl font-bold text-gray-800">Celebrare</h1>
          <div className="flex space-x-2">
            <Button
              onClick={undo}
              variant="outline"
              size="icon"
              disabled={historyIndex <= 0}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              onClick={redo}
              variant="outline"
              size="icon"
              disabled={historyIndex >= history.length - 1}
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Button onClick={exportAsPNG} variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="h-full w-full" ref={containerRef}>
          <canvas
            ref={canvasRef}
            className="p-4 border border-gray-200 rounded"
          />
        </div>
        <div className="p-4 border-t bg-gray-50">
          <div className="flex flex-wrap gap-2">
            <Button onClick={addText} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Add Text
            </Button>
            <Button
              onClick={() => toggleStyle("bold")}
              variant="outline"
              size="icon"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => toggleStyle("italic")}
              variant="outline"
              size="icon"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => toggleStyle("underline")}
              variant="outline"
              size="icon"
            >
              <Underline className="h-4 w-4" />
            </Button>
            <Select onValueChange={changeFontFamily}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Font Family" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Arial",
                  "Verdana",
                  "Helvetica",
                  "Times New Roman",
                  "Georgia",
                  "Courier New",
                  "Trebuchet MS",
                  "Lucida Console",
                  "Comic Sans MS",
                  "Impact",
                  "Tahoma",
                  "Palatino",
                  "Garamond",
                  "Arial Black",
                  "Bookman",
                ].map((font) => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => changeFontSize(Number(value))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                {fontSizes.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Type className="mr-2 h-4 w-4" /> Color
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <div className="flex space-x-2 mb-4">
                  {defaultColors.map((defaultColor) => (
                    <div
                      key={defaultColor}
                      className="w-8 h-8 rounded-full cursor-pointer border-2"
                      style={{
                        backgroundColor: defaultColor,
                        borderColor:
                          color === defaultColor ? "black" : "transparent",
                      }}
                      onClick={() => setColor(defaultColor)}
                    />
                  ))}
                </div>

                <HexColorPicker color={color} onChange={changeColor} />
              </PopoverContent>
            </Popover>
            <Button onClick={removeText} variant="outline">
              <Trash className="mr-2 h-4 w-4" /> Remove
            </Button>
          </div>
        </div>
        <footer className="w-full h-12 bg-gray-500 bottom-0 text-center p-2 text-white text-lg">
          <span className="w-fit">
            Project by{" "}
            <a href="https://github.com/hirendhola" className="font-bold">
              @HIRENDHOLA
            </a>{" "}
            😄
          </span>
        </footer>
      </div>
    </div>
  );
};

export default TextEditor;
