#!/usr/bin/env python3
"""
SafeNet IDS REST API Backend (FastAPI)
Author: NITYA123715
Enables seamless integration with modern Web Dashboards, React frontends, and SOC SIEM platforms.
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import pandas as pd
import io
from ids_enhanced_pipeline import EnhancedIDSEngine

app = FastAPI(
    title="SafeNet Network Intrusion Detection System API",
    description="High-performance machine learning backend for network packet inspection and real-time threat response.",
    version="2.4.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = EnhancedIDSEngine()

class NetworkFlowInput(BaseModel):
    src_ip: Optional[str] = "192.168.1.100"
    dst_ip: Optional[str] = "10.0.0.1"
    src_port: int = Field(..., ge=0, le=65535, description="Source TCP/UDP port")
    dst_port: int = Field(..., ge=0, le=65535, description="Destination TCP/UDP port")
    protocol: str = Field("TCP", description="Protocol: TCP, UDP, or ICMP")
    duration_sec: float = Field(..., ge=0.0, description="Connection duration in seconds")
    packet_count: int = Field(..., ge=0, description="Total packet volume")
    total_bytes: int = Field(..., ge=0, description="Total byte size of the connection")
    src_bytes: int = Field(0, ge=0)
    dst_bytes: int = Field(0, ge=0)
    avg_pkt_size: float = Field(..., ge=0.0)
    packets_per_sec: float = Field(..., ge=0.0)
    flags_count: int = Field(..., ge=0)
    ttl: int = Field(64, ge=1, le=255)
    payload_entropy: float = Field(..., description="Calculated Shannon entropy")

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "SafeNet IDS Engine",
        "model_loaded": engine.is_loaded,
        "engine_version": "2.4.0",
        "github_repo": "https://github.com/NITYA123715/IDS-Network-Intrusion-Detection-System"
    }

@app.post("/api/predict")
def predict_flow(flow: NetworkFlowInput):
    try:
        result = engine.predict_flow(flow.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/batch")
async def process_batch_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")
    
    content = await file.read()
    df = pd.read_csv(io.StringIO(content.decode('utf-8')))
    
    results = []
    attacks_count = 0
    
    for idx, row in df.iterrows():
        flow_dict = row.to_dict()
        pred = engine.predict_flow(flow_dict)
        pred['row_index'] = idx
        pred['src_ip'] = flow_dict.get('src_ip', 'N/A')
        pred['dst_ip'] = flow_dict.get('dst_ip', 'N/A')
        pred['dst_port'] = flow_dict.get('dst_port', 0)
        
        if pred['prediction'] == 'attack':
            attacks_count += 1
        results.append(pred)

    return {
        "total_records": len(df),
        "attacks_detected": attacks_count,
        "normal_flows": len(df) - attacks_count,
        "attack_rate": round((attacks_count / max(1, len(df))) * 100, 2),
        "results": results[:500]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
