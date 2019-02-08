import services from '../data/gatt-services-list.json';
import characteristics from '../data/gatt-characteristics-list.json';

export interface Service {
  id: string;
  name: string;
  code: string;
  specification: 'GSS';
}

export interface ServicesCache {
  [key: string]: Service
}

export const servicesCache = services.reduce((acc, service) => {
  acc[service.code] = service;
  return acc;
}, {});

export const characteristicsCache = characteristics.reduce((acc, characteristic) => {
  acc[characteristic.code] = characteristic;
  return acc;
}, {});

export const getServicePropFromHexString = (hexString: string, propName: string): string => {
  const service = servicesCache[hexString];
  if (service) {
    return service[propName];
  }
  return hexString;
};

export const formatHexShortCode = (uuid: string) => `0x${uuid.toUpperCase()}`;

export const getCharacteristicPropFromHexString = (hexString: string, propName: string): string => {
  const characteristic = characteristicsCache[hexString];
  if (characteristic) {
    return characteristic[propName];
  }
  return hexString;
};
