// submited by: ohad aizik 305088080 & ben amsalem 204294664

const axios = require('axios')
async function gettData(){
  try{
    let body = await axios.get('http://localhost:3000/getChallenge')
    return body.data
  }
  catch(error){
    console.log(error);
  }
}
async function paddingAttack(){
  console.log('here')
  let body = await gettData()
  let _buff = Buffer.from(body.data, 'hex')
  let dec = Buffer.alloc(_buff.length)

  for(let i=0 ; i<_buff.length ; i++)
  {
    let count = {tag: Buffer.alloc(1), pad: [], none: []}
    let buf = Buffer.alloc(_buff.length)
    _buff.copy(buf, i, 0, _buff.length - 1)
    if(i > 0)
      buf.fill(0,0,i)

    for(let j = 0 ; j < 256 ; j++){
      let newbuf = Buffer.alloc(buf.length)
      buf.copy(newbuf, 0)
      newbuf[newbuf.length - 1] ^= j
      let challengeAttemptJson = {data: newbuf.toString('hex'), key: body.key}
        let resChallengeJson = await axios.post('http://localhost:3000/attemptChallenge',challengeAttemptJson)
      switch(resChallengeJson.data.error){
        case "none":{
          count.none.push(j)
          break
        }
        case "pad":{
          count.pad.push(j)
          break
        }
        case "tag":{
          count.tag.writeUInt8(j)
          break
        }
      }
    }
    if(count.tag.length > 1)
      throw new Error(count.tag.length)
    dec[_buff.length - 1 - i] = count.tag[0] ^ 1
  }
  console.log(dec)
  console.log(dec.toString('ascii'))
}
paddingAttack()