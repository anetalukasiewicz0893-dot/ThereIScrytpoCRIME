
import React from 'react';

export const Manifesto: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center py-20 px-6 animate-in fade-in duration-1000">
      {/* Background Frame of Bitcoins */}
      <div className="absolute inset-0 pointer-events-none opacity-5 overflow-hidden -z-10">
        <div className="grid grid-cols-12 gap-8 h-full w-full">
          {Array.from({ length: 800 }).map((_, i) => (
            <div key={i} className="flex items-center justify-center">
              <svg className="w-10 h-10 text-yellow-500/50" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1.611 14.283c-.354.14-.852.257-1.424.342-.513.076-1.12.128-1.851.154l-.427 1.55h-.915l.421-1.52c-.229.006-.459.013-.69.021l-.421 1.52h-.915l.427-1.55c-.474.016-.948.04-1.42.073l.115.41h-.645l-.11-.403c-.328-.023-.623-.049-.885-.078-.17-.019-.286-.057-.348-.112-.062-.055-.084-.131-.066-.226l.483-1.748c.018-.095.064-.176.139-.244.075-.068.167-.107.275-.116.03-.002.059-.004.088-.004h.156l-.106.386c.207.014.383.05.529.111.146.061.21.162.192.304l-.472 1.708c-.018.095.011.153.088.174.077.021.2.032.368.032.22 0 .503.011.849.034l.436-1.578c.23-.008.46-.015.688-.023l-.434 1.57h.915l.424-1.53c.231-.008.461-.015.69-.022l-.424 1.53h.915l.436-1.578c.45-.015.845-.038 1.185-.068.513-.044.912-.132 1.198-.263.286-.131.503-.314.652-.549.149-.235.215-.526.198-.872-.016-.254-.082-.486-.197-.696a1.59 1.59 0 00-.518-.535 1.95 1.95 0 00-.73-.298c.31-.096.56-.247.747-.453s.314-.461.381-.766c.068-.305.07-.638.006-.998-.063-.448-.225-.826-.486-1.134-.26-.308-.616-.541-1.066-.699-.451-.158-.999-.244-1.644-.258-.291-.006-.63-.008-1.017-.006l.42-1.52h.915l-.424 1.53c.23-.008.46-.015.691-.023l-.424 1.53h.915l.42-1.52h.915l-.427 1.55c.618-.021 1.163-.006 1.636.046.613.067 1.107.214 1.48.441.373.227.64.555.8.983.16.428.196.953.109 1.574-.087.621-.309 1.126-.666 1.515-.357.389-.838.641-1.442.756z" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl bg-slate-950/95 border-x-4 border-yellow-500/20 p-12 md:p-24 shadow-2xl space-y-16">
        <header className="text-center space-y-6">
          <h2 className="text-xs font-black text-yellow-500 uppercase tracking-[0.8em]">Electronic Cash Protocol</h2>
          <h1 className="text-5xl md:text-7xl font-black text-white trm-heading uppercase leading-none">
            Bitcoin: A Peer-to-Peer Electronic Cash System
          </h1>
          <p className="text-slate-500 font-mono text-sm tracking-widest mt-4">Satoshi Nakamoto | satoshin@gmx.com | www.bitcoin.org</p>
        </header>

        <div className="h-px w-full bg-slate-800"></div>

        <article className="space-y-12 text-slate-300 font-serif text-lg leading-relaxed">
          <section className="space-y-6">
            <h3 className="text-white font-black uppercase tracking-widest text-sm border-l-2 border-yellow-500 pl-4">1. Abstract</h3>
            <p>
              A purely peer-to-peer version of electronic cash would allow online payments to be sent directly from one party to another without going through a financial institution. Digital signatures provide part of the solution, but the main benefits are lost if a trusted third party is still required to prevent double-spending.
            </p>
            <p>
              We propose a solution to the double-spending problem using a peer-to-peer network. The network timestamps transactions by hashing them into an ongoing chain of hash-based proof-of-work, forming a record that cannot be changed without redoing the proof-of-work. The longest chain not only serves as proof of the sequence of events witnessed, but proof that it came from the largest pool of CPU power.
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="text-white font-black uppercase tracking-widest text-sm border-l-2 border-yellow-500 pl-4">2. Introduction</h3>
            <p>
              Commerce on the Internet has come to rely almost exclusively on financial institutions serving as trusted third parties to process electronic payments. While the system works well enough for most transactions, it still suffers from the inherent weaknesses of the trust-based model. Completely non-reversible transactions are not really possible, since financial institutions cannot avoid mediating disputes.
            </p>
            <p>
              The cost of mediation increases transaction costs, limiting the minimum practical transaction size and cutting off the possibility for small casual transactions, and there is a broader cost in the loss of ability to make non-reversible payments for non-reversible services. With the possibility of reversal, the need for trust spreads.
            </p>
            <p>
              What is needed is an electronic payment system based on cryptographic proof instead of trust, allowing any two willing parties to transact directly with each other without the need for a trusted third party.
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="text-white font-black uppercase tracking-widest text-sm border-l-2 border-yellow-500 pl-4">3. Transactions</h3>
            <p>
              We define an electronic coin as a chain of digital signatures. Each owner transfers the coin to the next by digitally signing a hash of the previous transaction and the public key of the next owner and adding these to the end of the coin. A payee can verify the signatures to verify the chain of ownership.
            </p>
            <p>
              The problem of course is the payee can't verify that one of the owners did not double-spend the coin. A common solution is to introduce a trusted central authority, or mint, that checks every transaction for double spending. After each transaction, the coin must be returned to the mint to issue a new coin, and only coins issued directly from the mint are trusted not to be double-spent.
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="text-white font-black uppercase tracking-widest text-sm border-l-2 border-yellow-500 pl-4">4. Timestamp Server</h3>
            <p>
              The solution we propose begins with a timestamp server. A timestamp server works by taking a hash of a block of items to be timestamped and widely publishing the hash, such as in a newspaper or Usenet post. The timestamp proves that the data must have existed at the time, obviously, in order to get into the hash.
            </p>
            <p>
              Each timestamp includes the previous timestamp in its hash, forming a chain, with each additional timestamp reinforcing the ones before it.
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="text-white font-black uppercase tracking-widest text-sm border-l-2 border-yellow-500 pl-4">5. Proof-of-Work</h3>
            <p>
              To implement a distributed timestamp server on a peer-to-peer basis, we will need to use a proof-of-work system similar to Adam Back's Hashcash, rather than newspaper or Usenet posts. The proof-of-work involves scanning for a value that when hashed, such as with SHA-256, the hash begins with a number of zero bits. The average work required is exponential in the number of zero bits required and can be verified by executing a single hash.
            </p>
            <p>
              For our timestamp network, we implement the proof-of-work by incrementing a nonce in the block until a value is found that gives the block's hash the required zero bits. Once the CPU effort has been expended to make it satisfy the proof-of-work, the block cannot be changed without redoing the work.
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="text-white font-black uppercase tracking-widest text-sm border-l-2 border-yellow-500 pl-4">6. Network</h3>
            <p>The steps to run the network are as follows:</p>
            <ol className="list-decimal list-inside space-y-4 pl-4 text-slate-400">
              <li>New transactions are broadcast to all nodes.</li>
              <li>Each node collects new transactions into a block.</li>
              <li>Each node works on finding a difficult proof-of-work for its block.</li>
              <li>When a node finds a proof-of-work, it broadcasts the block to all nodes.</li>
              <li>Nodes accept the block only if all transactions in it are valid and not already spent.</li>
              <li>Nodes express their acceptance of the block by working on creating the next block in the chain, using the hash of the accepted block as the previous hash.</li>
            </ol>
            <p>
              Nodes always consider the longest chain to be the correct one and will keep working on extending it. If two nodes broadcast different versions of the next block simultaneously, some nodes may receive one or the other first. In that case, they work on the first one they received, but save the other branch in case it becomes longer.
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="text-white font-black uppercase tracking-widest text-sm border-l-2 border-yellow-500 pl-4">7. Incentive</h3>
            <p>
              By convention, the first transaction in a block is a special transaction that starts a new coin owned by the creator of the block. This adds an incentive for nodes to support the network, and provides a way to initially distribute coins into circulation, since there is no central authority to issue them.
            </p>
            <p>
              The incentive can also be funded with transaction fees. If the output value of a transaction is less than its input value, the difference is a transaction fee that is added to the incentive value of the block containing the transaction.
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="text-white font-black uppercase tracking-widest text-sm border-l-2 border-yellow-500 pl-4">8. Reclaiming Disk Space</h3>
            <p>
              Once the latest transaction in a coin is buried under enough blocks, the spent transactions before it can be discarded to save disk space. To facilitate this without breaking the block's hash, transactions are hashed in a Merkle Tree, with only the root included in the block's hash.
            </p>
            <p>
              Old blocks can then be compacted by stubbing off branches of the tree. The interior hashes do not need to be stored. A block header with no transactions would be about 80 bytes. If we suppose blocks are generated every 10 minutes, 80 bytes * 6 * 24 * 365 = 4.2MB per year.
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="text-white font-black uppercase tracking-widest text-sm border-l-2 border-yellow-500 pl-4">9. Simplified Payment Verification</h3>
            <p>
              It is possible to verify payments without running a full network node. A user only needs to keep a copy of the block headers of the longest proof-of-work chain, which he can get by querying network nodes until he's convinced he has the longest chain.
            </p>
            <p>
              He can't check the transaction for himself, but by linking it to a place in the chain, he can see that a network node has accepted it, and blocks added after it further confirm the network has accepted it.
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="text-white font-black uppercase tracking-widest text-sm border-l-2 border-yellow-500 pl-4">10. Combining and Splitting Value</h3>
            <p>
              Although it would be possible to handle coins individually, it would be unwieldy to make a separate transaction for every cent in a transfer. To allow value to be split and combined, transactions contain multiple inputs and outputs. Normally there will be either a single input from a larger previous transaction or multiple inputs combining smaller amounts, and at most two outputs: one for the payment, and one returning the change, if any, back to the sender.
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="text-white font-black uppercase tracking-widest text-sm border-l-2 border-yellow-500 pl-4">11. Privacy</h3>
            <p>
              The traditional banking model achieves a level of privacy by limiting access to information to the parties involved and the trusted third party. The necessity to announce all transactions publicly precludes this method, but privacy can still be maintained by breaking the flow of information in another place: by keeping public keys anonymous. The public can see that someone is sending an amount to someone else, but without information linking the transaction to anyone.
            </p>
            <p>
              As an additional firewall, a new key pair should be used for each transaction to keep them from being linked to a common owner.
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="text-white font-black uppercase tracking-widest text-sm border-l-2 border-yellow-500 pl-4">12. Calculations</h3>
            <p>
              We consider the scenario of an attacker trying to generate an alternate chain faster than the honest chain. Even if this is accomplished, it does not open the system to arbitrary changes, such as creating value out of thin air or taking money that never belonged to the attacker.
            </p>
            <p>
              The probability of an attacker catching up from a given deficit is analogous to a Gambler's Ruin problem. Suppose a gambler with unlimited credit starts at a deficit and plays potentially an infinite number of trials to try to reach breakeven.
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="text-white font-black uppercase tracking-widest text-sm border-l-2 border-yellow-500 pl-4">13. Conclusion</h3>
            <p>
              We have proposed a system for electronic transactions without relying on trust. We started with the usual framework of coins made from digital signatures, which provides strong control of ownership, but is incomplete without a way to prevent double-spending.
            </p>
            <p>
              To solve this, we proposed a peer-to-peer network using proof-of-work to record a public history of transactions that quickly becomes computationally impractical for an attacker to change if honest nodes control a majority of CPU power. The network is robust in its unstructured simplicity. Nodes work all at once with little coordination. They do not need to be identified, since messages are not routed to any particular place and only need to be delivered on a best effort basis.
            </p>
          </section>
        </article>

        <footer className="pt-20 text-center space-y-4 border-t border-slate-900">
          <div className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">End of Protocol v1.0 // Genesis Block Root</div>
          <p className="text-[8px] text-slate-700 font-mono">HASH: 000000000019D6689C085AE165831E934FF763AE46A2A6C172B3F1B60A8CE26F</p>
          <div className="pt-4 text-[7px] text-slate-800 uppercase tracking-widest">In Code We Trust</div>
        </footer>
      </div>
    </div>
  );
};
