import { NetworkFlow } from '../types/ids';

const BENIGN_SRC_IPS = [
  '192.168.1.105', '192.168.1.142', '10.0.4.55', '172.16.12.80',
  '192.168.2.204', '10.10.8.19', '172.20.100.12', '192.168.10.99'
];

const ATTACK_SRC_IPS = [
  '185.220.101.5', '45.154.255.89', '194.26.29.112', '198.51.100.77',
  '103.251.167.20', '91.240.118.172', '109.237.103.44', '141.98.11.10'
];

const DEST_SERVERS = [
  { ip: '10.0.0.10', port: 443, service: 'HTTPS Gateway', proto: 'TCP' },
  { ip: '10.0.0.12', port: 80, service: 'Nginx Web Proxy', proto: 'TCP' },
  { ip: '10.0.0.25', port: 3306, service: 'Production MySQL DB', proto: 'TCP' },
  { ip: '10.0.0.5', port: 53, service: 'Internal Core DNS', proto: 'UDP' },
  { ip: '10.0.0.20', port: 22, service: 'Bastion SSH Server', proto: 'TCP' },
  { ip: '10.0.0.15', port: 8080, service: 'App API Cluster', proto: 'TCP' },
];

let flowCounter = 1000;

export function generateBenignFlow(): NetworkFlow {
  flowCounter++;
  const src = BENIGN_SRC_IPS[Math.floor(Math.random() * BENIGN_SRC_IPS.length)];
  const server = DEST_SERVERS[Math.floor(Math.random() * DEST_SERVERS.length)];
  const srcPort = 32000 + Math.floor(Math.random() * 30000);
  const duration = parseFloat((0.05 + Math.random() * 0.8).toFixed(4));
  const packetCount = Math.floor(6 + Math.random() * 14);
  const avgPktSize = parseFloat((300 + Math.random() * 500).toFixed(1));
  const totalBytes = Math.floor(packetCount * avgPktSize);
  const srcBytes = Math.floor(totalBytes * (0.25 + Math.random() * 0.3));
  const dstBytes = totalBytes - srcBytes;
  const pps = parseFloat((packetCount / Math.max(0.01, duration)).toFixed(2));
  const flags = Math.floor(1 + Math.random() * 4);
  const ttl = [64, 128, 255][Math.floor(Math.random() * 3)];
  const entropy = parseFloat((-1.5 + Math.random() * 4.8).toFixed(3));

  return {
    id: `stream-${flowCounter}`,
    src_ip: src,
    dst_ip: server.ip,
    src_port: srcPort,
    dst_port: server.port,
    protocol: server.proto,
    duration_sec: duration,
    packet_count: packetCount,
    total_bytes: totalBytes,
    src_bytes: srcBytes,
    dst_bytes: dstBytes,
    avg_pkt_size: avgPktSize,
    packets_per_sec: pps,
    flags_count: flags,
    ttl,
    payload_entropy: entropy,
    label: 'normal',
    attack_type: 'normal',
    timestamp: new Date().toLocaleTimeString(),
  };
}

export function generateAttackFlow(specificType?: string): NetworkFlow {
  flowCounter++;
  const types = ['dos', 'portscan', 'bruteforce', 'sql_injection', 'malware'];
  const type = specificType || types[Math.floor(Math.random() * types.length)];
  const src = ATTACK_SRC_IPS[Math.floor(Math.random() * ATTACK_SRC_IPS.length)];
  const srcPort = 40000 + Math.floor(Math.random() * 20000);

  if (type === 'dos') {
    const server = DEST_SERVERS[0]; // 443
    const duration = parseFloat((8.0 + Math.random() * 15.0).toFixed(2));
    const packetCount = Math.floor(2500 + Math.random() * 4000);
    const avgPktSize = 160.0;
    const totalBytes = packetCount * 160;
    const srcBytes = Math.floor(totalBytes * 0.88);
    const dstBytes = totalBytes - srcBytes;
    const pps = parseFloat((packetCount / duration).toFixed(2));

    return {
      id: `stream-${flowCounter}`,
      src_ip: src,
      dst_ip: server.ip,
      src_port: srcPort,
      dst_port: server.port,
      protocol: 'TCP',
      duration_sec: duration,
      packet_count: packetCount,
      total_bytes: totalBytes,
      src_bytes: srcBytes,
      dst_bytes: dstBytes,
      avg_pkt_size: avgPktSize,
      packets_per_sec: pps,
      flags_count: Math.floor(40 + Math.random() * 30),
      ttl: 128,
      payload_entropy: parseFloat((3.2 + Math.random() * 1.5).toFixed(3)),
      label: 'attack',
      attack_type: 'dos',
      timestamp: new Date().toLocaleTimeString(),
    };
  }

  if (type === 'portscan') {
    const scannedPort = [21, 22, 23, 25, 80, 135, 139, 443, 445, 1433, 3306, 8080][Math.floor(Math.random() * 12)];
    const duration = parseFloat((1.5 + Math.random() * 2.0).toFixed(3));
    const packetCount = Math.floor(140 + Math.random() * 160);
    const avgPktSize = 175.0;
    const totalBytes = packetCount * 175;
    const srcBytes = Math.floor(totalBytes * 0.7);
    const dstBytes = totalBytes - srcBytes;
    const pps = parseFloat((packetCount / duration).toFixed(2));

    return {
      id: `stream-${flowCounter}`,
      src_ip: src,
      dst_ip: '10.0.0.12',
      src_port: srcPort,
      dst_port: scannedPort,
      protocol: 'TCP',
      duration_sec: duration,
      packet_count: packetCount,
      total_bytes: totalBytes,
      src_bytes: srcBytes,
      dst_bytes: dstBytes,
      avg_pkt_size: avgPktSize,
      packets_per_sec: pps,
      flags_count: Math.floor(10 + Math.random() * 8),
      ttl: 64,
      payload_entropy: parseFloat((7.8 + Math.random() * 0.2).toFixed(3)),
      label: 'attack',
      attack_type: 'portscan',
      timestamp: new Date().toLocaleTimeString(),
    };
  }

  if (type === 'sql_injection') {
    const server = [DEST_SERVERS[1], DEST_SERVERS[2], DEST_SERVERS[5]][Math.floor(Math.random() * 3)];
    const duration = parseFloat((1.5 + Math.random() * 1.5).toFixed(3));
    const packetCount = Math.floor(30 + Math.random() * 40);
    const avgPktSize = 186.0;
    const totalBytes = packetCount * 186;
    const srcBytes = Math.floor(totalBytes * 0.55);
    const dstBytes = totalBytes - srcBytes;
    const pps = parseFloat((packetCount / duration).toFixed(2));

    return {
      id: `stream-${flowCounter}`,
      src_ip: src,
      dst_ip: server.ip,
      src_port: srcPort,
      dst_port: server.port,
      protocol: 'TCP',
      duration_sec: duration,
      packet_count: packetCount,
      total_bytes: totalBytes,
      src_bytes: srcBytes,
      dst_bytes: dstBytes,
      avg_pkt_size: avgPktSize,
      packets_per_sec: pps,
      flags_count: 5,
      ttl: 255,
      payload_entropy: parseFloat((6.2 + Math.random() * 1.6).toFixed(3)),
      label: 'attack',
      attack_type: 'sql_injection',
      timestamp: new Date().toLocaleTimeString(),
    };
  }

  if (type === 'bruteforce') {
    const duration = parseFloat((80.0 + Math.random() * 200.0).toFixed(2));
    const packetCount = Math.floor(300 + Math.random() * 200);
    const avgPktSize = 420.0;
    const totalBytes = packetCount * 420;
    const srcBytes = Math.floor(totalBytes * 0.52);
    const dstBytes = totalBytes - srcBytes;
    const pps = parseFloat((packetCount / duration).toFixed(2));

    return {
      id: `stream-${flowCounter}`,
      src_ip: src,
      dst_ip: '10.0.0.20', // SSH
      src_port: srcPort,
      dst_port: 22,
      protocol: 'TCP',
      duration_sec: duration,
      packet_count: packetCount,
      total_bytes: totalBytes,
      src_bytes: srcBytes,
      dst_bytes: dstBytes,
      avg_pkt_size: avgPktSize,
      packets_per_sec: pps,
      flags_count: Math.floor(12 + Math.random() * 10),
      ttl: 64,
      payload_entropy: parseFloat((6.8 + Math.random() * 1.2).toFixed(3)),
      label: 'attack',
      attack_type: 'bruteforce',
      timestamp: new Date().toLocaleTimeString(),
    };
  }

  // malware
  const duration = parseFloat((110.0 + Math.random() * 50.0).toFixed(2));
  const packetCount = Math.floor(700 + Math.random() * 150);
  const avgPktSize = 360.0;
  const totalBytes = packetCount * 360;
  const srcBytes = Math.floor(totalBytes * 0.08); // small checkin
  const dstBytes = totalBytes - srcBytes; // large payload response
  const pps = parseFloat((packetCount / duration).toFixed(2));

  return {
    id: `stream-${flowCounter}`,
    src_ip: src,
    dst_ip: '10.0.0.15',
    src_port: srcPort,
    dst_port: 8080,
    protocol: 'TCP',
    duration_sec: duration,
    packet_count: packetCount,
    total_bytes: totalBytes,
    src_bytes: srcBytes,
    dst_bytes: dstBytes,
    avg_pkt_size: avgPktSize,
    packets_per_sec: pps,
    flags_count: Math.floor(35 + Math.random() * 20),
    ttl: 128,
    payload_entropy: parseFloat((3.4 + Math.random() * 1.8).toFixed(3)),
    label: 'attack',
    attack_type: 'malware',
    timestamp: new Date().toLocaleTimeString(),
  };
}
