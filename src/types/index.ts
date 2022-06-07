export interface INodeData {
  community: string;
  id: number;
  industry: IndustryType[];
  isCore: string;
  label: NodeType;
  name: string;
  uid: string;
}

export interface ILinkData {
  endId: number;
  startId: number;
  type: LinkType;
}

export type LinkType =
  | 'r_cert'
  | 'r_subdomain'
  | 'r_request_jump'
  | 'r_dns_a'
  | 'r_whois_name'
  | 'r_whois_email'
  | 'r_whois_phone'
  | 'r_cert_chain'
  | 'r_cname'
  | 'r_asn'
  | 'r_cidr';

export type NodeType = 'Domain' | 'IP' | 'Cert' | 'Whois_Name' | 'Whois_Phone' | 'Whois_Email' | 'IP_C' | 'ASN';

export type IndustryType = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I';

export const LinkTypeNames = {
  r_cert: '域名使用的安全证书',
  r_subdomain: '域名拥有的子域名',
  r_request_jump: '域名间跳转关系',
  r_dns_a: '域名对应的IP地址',
  r_whois_name: '域名的注册人姓名',
  r_whois_email: '域名的注册人邮箱',
  r_whois_phone: '域名的注册人电话',
  r_cert_chain: '证书的证书链关系',
  r_cname: '域名对应的别名',
  r_asn: 'IP所属的自治域',
  r_cidr: 'IP所对应的C段',
};

export const NodeTypeNames = {
  Domain: '网站域名',
  IP: '网站的IP地址',
  Cert: '网站用的SSL安全证书',
  Whois_Name: '网站域名的注册人姓名',
  Whois_Phone: '网站域名的注册人电话',
  Whois_Email: '网站域名的注册人邮箱',
  IP_C: 'IP的C段',
  ASN: 'IP的自治域',
};

export const IndustryTypeNames = {
  A: '涉黄',
  B: '涉赌',
  C: '诈骗',
  D: '涉毒',
  E: '涉枪',
  F: '黑客',
  G: '非法交易平台',
  H: '非法支付平台',
  I: '其他',
};

export const industryType = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
