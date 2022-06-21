type URLString = string & { __description: 'URLString' };
type HostString = string & { __description: 'HostString' };
type PathString = string & { __description: 'PathString' };

interface Rule {
  type: browser.webRequest.ResourceType | browser.webRequest.ResourceType[] | '*';
  method?: '*' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'PATCH';
  host: HostString | RegExp | '*';
  path: PathString | RegExp | '*';
  action: 'strip' | 'drop'
  query?: (string | RegExp)[] | '*';
}
