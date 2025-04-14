"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette } from "lucide-react";

interface ThemeSettings {
  primaryHue: number;
  primarySaturation: number;
  primaryLightness: number;
  primaryColor: string;
  secondaryHue: number;
  secondarySaturation: number;
  secondaryLightness: number;
  secondaryColor: string;
}

export function ThemeControl() {
  const [isOpen, setIsOpen] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [primaryHue, setPrimaryHue] = useState(0);
  const [primarySaturation, setPrimarySaturation] = useState(100);
  const [primaryLightness, setPrimaryLightness] = useState(50);
  const [secondaryColor, setSecondaryColor] = useState("#000000");
  const [secondaryHue, setSecondaryHue] = useState(0);
  const [secondarySaturation, setSecondarySaturation] = useState(100);
  const [secondaryLightness, setSecondaryLightness] = useState(50);
  const panelRef = useRef<HTMLDivElement>(null);

  // localStorage에서 테마 설정을 불러옵니다
  useEffect(() => {
    const savedSettings = localStorage.getItem("themeSettings");
    if (savedSettings) {
      const settings: ThemeSettings = JSON.parse(savedSettings);
      setPrimaryHue(settings.primaryHue);
      setPrimarySaturation(settings.primarySaturation);
      setPrimaryLightness(settings.primaryLightness);
      setPrimaryColor(settings.primaryColor);
      setSecondaryHue(settings.secondaryHue);
      setSecondarySaturation(settings.secondarySaturation);
      setSecondaryLightness(settings.secondaryLightness);
      setSecondaryColor(settings.secondaryColor);
      document.documentElement.style.setProperty(
        "--primary",
        settings.primaryColor
      );
      document.documentElement.style.setProperty(
        "--secondary",
        settings.secondaryColor
      );
    }
  }, []);

  // 패널 바깥 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePrimaryColorChange = (h: number, s: number, l: number) => {
    setPrimaryHue(h);
    setPrimarySaturation(s);
    setPrimaryLightness(l);
    const color = `hsl(${h}, ${s}%, ${l}%)`;
    setPrimaryColor(color);
    document.documentElement.style.setProperty("--primary", color);

    // 테마 설정을 localStorage에 저장합니다
    const settings: ThemeSettings = {
      primaryHue: h,
      primarySaturation: s,
      primaryLightness: l,
      primaryColor: color,
      secondaryHue,
      secondarySaturation,
      secondaryLightness,
      secondaryColor,
    };
    localStorage.setItem("themeSettings", JSON.stringify(settings));
  };

  const handleSecondaryColorChange = (h: number, s: number, l: number) => {
    setSecondaryHue(h);
    setSecondarySaturation(s);
    setSecondaryLightness(l);
    const color = `hsl(${h}, ${s}%, ${l}%)`;
    setSecondaryColor(color);
    document.documentElement.style.setProperty("--secondary", color);

    // 테마 설정을 localStorage에 저장합니다
    const settings: ThemeSettings = {
      primaryHue,
      primarySaturation,
      primaryLightness,
      primaryColor,
      secondaryHue: h,
      secondarySaturation: s,
      secondaryLightness: l,
      secondaryColor: color,
    };
    localStorage.setItem("themeSettings", JSON.stringify(settings));
  };

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Palette className="h-5 w-5" />
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 z-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              테마 컨트롤
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Primary 색상 미리보기</Label>
                <div
                  className="h-10 w-full rounded-md"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>

              <div className="space-y-2">
                <Label>Primary 색상 코드</Label>
                <Input
                  value={primaryColor || ""}
                  readOnly
                  onChange={() => {}}
                />
              </div>

              <div className="space-y-2">
                <Label>Primary 색상 (Hue)</Label>
                <Slider
                  value={[primaryHue]}
                  onValueChange={([value]) =>
                    handlePrimaryColorChange(
                      value,
                      primarySaturation,
                      primaryLightness
                    )
                  }
                  max={360}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Primary 채도 (Saturation)</Label>
                <Slider
                  value={[primarySaturation]}
                  onValueChange={([value]) =>
                    handlePrimaryColorChange(
                      primaryHue,
                      value,
                      primaryLightness
                    )
                  }
                  max={100}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Primary 명도 (Lightness)</Label>
                <Slider
                  value={[primaryLightness]}
                  onValueChange={([value]) =>
                    handlePrimaryColorChange(
                      primaryHue,
                      primarySaturation,
                      value
                    )
                  }
                  max={100}
                  step={1}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Secondary 색상 미리보기</Label>
                <div
                  className="h-10 w-full rounded-md"
                  style={{ backgroundColor: secondaryColor }}
                />
              </div>

              <div className="space-y-2">
                <Label>Secondary 색상 코드</Label>
                <Input
                  value={secondaryColor || ""}
                  readOnly
                  onChange={() => {}}
                />
              </div>

              <div className="space-y-2">
                <Label>Secondary 색상 (Hue)</Label>
                <Slider
                  value={[secondaryHue]}
                  onValueChange={([value]) =>
                    handleSecondaryColorChange(
                      value,
                      secondarySaturation,
                      secondaryLightness
                    )
                  }
                  max={360}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Secondary 채도 (Saturation)</Label>
                <Slider
                  value={[secondarySaturation]}
                  onValueChange={([value]) =>
                    handleSecondaryColorChange(
                      secondaryHue,
                      value,
                      secondaryLightness
                    )
                  }
                  max={100}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Secondary 명도 (Lightness)</Label>
                <Slider
                  value={[secondaryLightness]}
                  onValueChange={([value]) =>
                    handleSecondaryColorChange(
                      secondaryHue,
                      secondarySaturation,
                      value
                    )
                  }
                  max={100}
                  step={1}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
