import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Button, TextField } from '@radix-ui/themes';
import { CSSProperties, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ARWEAVE_TX_ID_REGEX, ARWEAVE_TX_ID_REGEX_PARTIAL } from '../../constants/common';
import { useGlobalState } from '../../services/state/contexts/GlobalState';

function Search({
  submitCallback,
  onChangeCallback,
  style,
}: {
  style?: CSSProperties;
  submitCallback?: (query: string) => void;
  onChangeCallback?: (query: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchParams, setSearchparams] = useSearchParams();
  const [{ arweave }] = useGlobalState();
  const navigate = useNavigate();

  useEffect(() => {
    const urlSearchQuery = searchParams.get('search') || '';
    if (urlSearchQuery !== searchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [searchParams]);

  async function handleSearch(id: string) {


    try {
       if (submitCallback) {
      submitCallback(id);
    }
    if (id !== searchParams.get('search')) {
      setSearchparams({ search: id });
    }

    if (ARWEAVE_TX_ID_REGEX.test(id)) {
      const res = await arweave.api.get('/tx/'+id)
      const tags = res.data.tags.map((tag:any)=> ({name: atob(tag.name), value: atob(tag.value)}))
      const contractSourceId = tags.find((tag:any)=> tag.name === "Contract-Src")?.value
      if (contractSourceId) {
        navigate(`/contract/${id}`)
      }
      
    }
    } catch (error) {
      console.error(error)
    }
   
  }

  function handleSearchChange(e: any) {
    e.preventDefault();

    const query = e.target.value.trim();
    if (!ARWEAVE_TX_ID_REGEX_PARTIAL.test(query)) {
      return
    }
    if (onChangeCallback) {
      onChangeCallback(query);
    }
    if (!query.length) {
      setSearchparams({});
    }
    setSearchQuery(e.target.value);
  }

  return (
    <TextField.Root style={{ width: '50%' }}>
      <TextField.Input
        placeholder="Search for a SmartWeave contract"
        onKeyDown={(e) => (e.key === 'Enter' ? handleSearch(searchQuery) : null)}
        onChange={handleSearchChange}
        value={searchQuery}
        maxLength={43}
        style={style}
        radius="full"
      />
      <TextField.Slot>
        <Button
          variant="ghost"
          radius="full"
          onClick={()=> handleSearch(searchQuery)}
          style={{ marginRight: '1px' }}
        >
          <MagnifyingGlassIcon height="16" width="16" />
        </Button>
      </TextField.Slot>
    </TextField.Root>
  );
}

export default Search;
