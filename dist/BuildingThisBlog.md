<p>I immediately dug the instantness of github.io. Being pretty bare bones though
I was initially woed by Jekyll. About a quarter of the way into the instructions
though, I found myself saying. You know what - you&#39;ve done so little web stuff
in recent days. Why don&#39;t you take a moment and build it out yourself?</p>
<p>The first thing I knew is I wanted to write in my editor of choice using
Markdown because, well, Markdown is fast, fluent, easy and we all know it well
from creating github README.mds.</p>
<p>I also wanted the site to be pretty and have some neat features that I could
code myself. This would also (in theory) allow me to build the scaffolding of
the site to taste, force me to brush up my CSS skills and generally let me have
a place to drop new client side web tech without much overhead. (I&#39;m sure at
some point I&#39;ll need a server, but we&#39;ll see).</p>
<p>I don&#39;t want to host a backend and I want to push and revise content in git.
Obviously github.io is the perfect fit, but I wanted to build up a scaffolding
that let me publish as easily as deploying code. I also wanted to be able to
save drafts and review them locally before pushing.</p>
<p>So the first post in this blog is how I built this blog. One of my favorite
blog of all time both for content, layout and style is www.substack.net (which
is also gitpowered, but I still want to write my own), so I&#39;ll pattern off off
that for general usability. (Imitation is the the most sincere form of flattery?)
We&#39;ll have a scrolling lists of posts and click through to view the full post.</p>
<p>Last but not least, it was my intention to get a first version of this done in
under and hour while on the train to work, so simplicity and time was of
primary importance.</p>
<p>So off to the races.</p>
<p>First things first: <em>Easy markdown to html</em></p>
<p>(<a href="https://github.com/chjj/marked)[chjj/marked">https://github.com/chjj/marked)[chjj/marked</a>] stood out here
as my best option for node as the syntax highlighting sample was simple to follow
and if I don&#39;t have syntax hilighting then I know down the line I&#39;m going to be
sad.</p>
<p>(I guess we&#39;ll put that to the test now, with a github style code bracket)</p>
<p>First we install some prereqs and end up with an already impressively long
package.json:</p>
<pre><code class="lang-javascript"><div class="highlight"><pre><span class="p">{</span>
  <span class="s2">&quot;name&quot;</span><span class="o">:</span> <span class="s2">&quot;j03m.github.io&quot;</span><span class="p">,</span>
  <span class="s2">&quot;version&quot;</span><span class="o">:</span> <span class="s2">&quot;1.0.0&quot;</span><span class="p">,</span>
  <span class="s2">&quot;description&quot;</span><span class="o">:</span> <span class="s2">&quot;J03m&#39;s blog. &quot;</span><span class="p">,</span>
  <span class="s2">&quot;main&quot;</span><span class="o">:</span> <span class="s2">&quot;index.html&quot;</span><span class="p">,</span>
  <span class="s2">&quot;scripts&quot;</span><span class="o">:</span> <span class="p">{</span>
    <span class="s2">&quot;test&quot;</span><span class="o">:</span> <span class="s2">&quot;none&quot;</span>
  <span class="p">},</span>
  <span class="s2">&quot;repository&quot;</span><span class="o">:</span> <span class="p">{</span>
    <span class="s2">&quot;type&quot;</span><span class="o">:</span> <span class="s2">&quot;git&quot;</span><span class="p">,</span>
    <span class="s2">&quot;url&quot;</span><span class="o">:</span> <span class="s2">&quot;https://github.com/j03m/j03m.github.io&quot;</span>
  <span class="p">},</span>
  <span class="s2">&quot;keywords&quot;</span><span class="o">:</span> <span class="p">[</span>
    <span class="s2">&quot;j03m&quot;</span>
  <span class="p">],</span>
  <span class="s2">&quot;author&quot;</span><span class="o">:</span> <span class="s2">&quot;j03m&quot;</span><span class="p">,</span>
  <span class="s2">&quot;license&quot;</span><span class="o">:</span> <span class="s2">&quot;MIT&quot;</span><span class="p">,</span>
  <span class="s2">&quot;bugs&quot;</span><span class="o">:</span> <span class="p">{</span>
    <span class="s2">&quot;url&quot;</span><span class="o">:</span> <span class="s2">&quot;https://github.com/j03m/j03m.github.io/issues&quot;</span>
  <span class="p">},</span>
  <span class="s2">&quot;homepage&quot;</span><span class="o">:</span> <span class="s2">&quot;https://github.com/j03m/j03m.github.io&quot;</span><span class="p">,</span>
  <span class="s2">&quot;dependencies&quot;</span><span class="o">:</span> <span class="p">{</span>
    <span class="s2">&quot;bluebird&quot;</span><span class="o">:</span> <span class="s2">&quot;^2.9.24&quot;</span><span class="p">,</span>
    <span class="s2">&quot;marked&quot;</span><span class="o">:</span> <span class="s2">&quot;^0.3.3&quot;</span><span class="p">,</span>
    <span class="s2">&quot;pygmentize-bundled&quot;</span><span class="o">:</span> <span class="s2">&quot;^2.3.0&quot;</span><span class="p">,</span>
    <span class="s2">&quot;yargs&quot;</span><span class="o">:</span> <span class="s2">&quot;^3.7.0&quot;</span>
  <span class="p">}</span>
<span class="p">}</span>
</pre></div>

</code></pre>
<p>You can google the depedencies I used, but basically this handles promises, md
conversion, syntax highlighting and cli options.</p>
<p>Okay and marked is installed. So at this point I decided I&#39;d start writing some
really simple commandline style scripts for blog actions and eventually wire
them together with gulp for watching markdowns, transforming and pushing branches
with gitjs.</p>
<p>But I&#39;m getting ahead of myself. Let&#39;s test some write some js code that will
generate this post and see how it looks. This is almost mind blowing.</p>
<pre><code class="lang-javascript"><div class="highlight"><pre><span class="err">#</span><span class="o">!</span><span class="err">/usr/bin/env node</span>
<span class="kd">var</span> <span class="nx">marked</span> <span class="o">=</span> <span class="nx">require</span><span class="p">(</span><span class="s1">&#39;marked&#39;</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">pb</span> <span class="o">=</span> <span class="nx">require</span><span class="p">(</span><span class="s1">&#39;pygmentize-bundled&#39;</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">fs</span> <span class="o">=</span> <span class="nx">require</span><span class="p">(</span><span class="s1">&#39;fs&#39;</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">Promise</span> <span class="o">=</span> <span class="nx">require</span><span class="p">(</span><span class="s1">&#39;bluebird&#39;</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">fsp</span> <span class="o">=</span> <span class="nx">Promise</span><span class="p">.</span><span class="nx">promisifyAll</span><span class="p">(</span><span class="nx">fs</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">markedP</span> <span class="o">=</span> <span class="nx">Promise</span><span class="p">.</span><span class="nx">promisify</span><span class="p">(</span><span class="nx">marked</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">pbp</span> <span class="o">=</span> <span class="nx">Promise</span><span class="p">.</span><span class="nx">promisify</span><span class="p">(</span><span class="nx">pb</span><span class="p">);</span>


<span class="kd">function</span> <span class="nx">md2post</span><span class="p">(</span><span class="nx">input</span><span class="p">)</span> <span class="p">{</span>
    <span class="nx">marked</span><span class="p">.</span><span class="nx">setOptions</span><span class="p">({</span>
        <span class="nx">renderer</span><span class="o">:</span> <span class="k">new</span> <span class="nx">marked</span><span class="p">.</span><span class="nx">Renderer</span><span class="p">(),</span>
        <span class="nx">gfm</span><span class="o">:</span> <span class="kc">true</span><span class="p">,</span>
        <span class="nx">tables</span><span class="o">:</span> <span class="kc">true</span><span class="p">,</span>
        <span class="nx">breaks</span><span class="o">:</span> <span class="kc">false</span><span class="p">,</span>
        <span class="nx">pedantic</span><span class="o">:</span> <span class="kc">false</span><span class="p">,</span>
        <span class="nx">sanitize</span><span class="o">:</span> <span class="kc">true</span><span class="p">,</span>
        <span class="nx">smartLists</span><span class="o">:</span> <span class="kc">true</span><span class="p">,</span>
        <span class="nx">smartypants</span><span class="o">:</span> <span class="kc">false</span><span class="p">,</span>
        <span class="nx">highlight</span><span class="o">:</span> <span class="kd">function</span> <span class="p">(</span><span class="nx">code</span><span class="p">,</span> <span class="nx">lang</span><span class="p">,</span> <span class="nx">callback</span><span class="p">)</span> <span class="p">{</span>
            <span class="nx">pbp</span><span class="p">({</span><span class="nx">lang</span><span class="o">:</span> <span class="nx">lang</span><span class="p">,</span> <span class="nx">format</span><span class="o">:</span> <span class="s1">&#39;html&#39;</span><span class="p">},</span> <span class="nx">code</span><span class="p">).</span><span class="nx">then</span><span class="p">(</span><span class="kd">function</span> <span class="p">(</span><span class="nx">result</span><span class="p">)</span> <span class="p">{</span>
                <span class="nx">callback</span><span class="p">(</span><span class="kc">null</span><span class="p">,</span> <span class="nx">result</span><span class="p">.</span><span class="nx">toString</span><span class="p">());</span>
            <span class="p">});</span> <span class="c1">//crash on reject</span>
        <span class="p">}</span>
    <span class="p">});</span>
    <span class="k">return</span> <span class="nx">markedP</span><span class="p">(</span><span class="nx">input</span><span class="p">);</span>
<span class="p">};</span>
<span class="nx">exports</span><span class="p">.</span><span class="nx">md2post</span> <span class="o">=</span> <span class="nx">md2post</span><span class="p">;</span>


<span class="kd">function</span> <span class="nx">transform</span><span class="p">(</span><span class="nx">input</span><span class="p">,</span> <span class="nx">output</span><span class="p">)</span> <span class="p">{</span>
    <span class="k">return</span> <span class="nx">fsp</span><span class="p">.</span><span class="nx">readFileAsync</span><span class="p">(</span><span class="nx">input</span><span class="p">).</span><span class="nx">then</span><span class="p">(</span><span class="kd">function</span> <span class="p">(</span><span class="nx">rawFile</span><span class="p">)</span> <span class="p">{</span>
        <span class="k">return</span> <span class="nx">md2post</span><span class="p">(</span><span class="nx">rawFile</span><span class="p">.</span><span class="nx">toString</span><span class="p">());</span>
    <span class="p">}).</span><span class="nx">then</span><span class="p">(</span><span class="kd">function</span> <span class="p">(</span><span class="nx">html</span><span class="p">)</span> <span class="p">{</span>
        <span class="k">return</span> <span class="nx">fs</span><span class="p">.</span><span class="nx">writeFileAsync</span><span class="p">(</span><span class="nx">output</span><span class="p">,</span> <span class="nx">html</span><span class="p">);</span>
    <span class="p">});</span>
<span class="p">}</span>
<span class="nx">exports</span><span class="p">.</span><span class="nx">transform</span> <span class="o">=</span> <span class="nx">transform</span><span class="p">;</span>


<span class="k">if</span> <span class="p">(</span><span class="o">!</span><span class="nx">module</span><span class="p">.</span><span class="nx">parent</span><span class="p">)</span> <span class="p">{</span>
    <span class="kd">var</span> <span class="nx">argv</span> <span class="o">=</span> <span class="nx">require</span><span class="p">(</span><span class="s1">&#39;yargs&#39;</span><span class="p">).</span><span class="nx">usage</span><span class="p">(</span><span class="s1">&#39;Usage: $0 --input [path to input file] --output [path to output file]&#39;</span><span class="p">)</span>
        <span class="p">.</span><span class="nx">demand</span><span class="p">([</span><span class="s1">&#39;input&#39;</span><span class="p">,</span> <span class="s1">&#39;output&#39;</span><span class="p">])</span>
        <span class="p">.</span><span class="nx">argv</span><span class="p">;</span>
    <span class="nx">transform</span><span class="p">(</span><span class="nx">argv</span><span class="p">.</span><span class="nx">input</span><span class="p">,</span> <span class="nx">argv</span><span class="p">.</span><span class="nx">output</span><span class="p">).</span><span class="nx">then</span><span class="p">(</span><span class="kd">function</span> <span class="p">(</span><span class="nx">result</span><span class="p">)</span> <span class="p">{</span>
        <span class="nx">console</span><span class="p">.</span><span class="nx">log</span><span class="p">(</span><span class="s2">&quot;Success!&quot;</span><span class="p">);</span>
        <span class="nx">process</span><span class="p">.</span><span class="nx">exit</span><span class="p">(</span><span class="mi">0</span><span class="p">);</span>
    <span class="p">}).</span><span class="nx">error</span><span class="p">(</span><span class="kd">function</span> <span class="p">(</span><span class="nx">e</span><span class="p">)</span> <span class="p">{</span>
        <span class="nx">console</span><span class="p">.</span><span class="nx">log</span><span class="p">(</span><span class="s2">&quot;Failed:&quot;</span><span class="p">,</span> <span class="nx">e</span><span class="p">);</span>
        <span class="nx">process</span><span class="p">.</span><span class="nx">exit</span><span class="p">(</span><span class="o">-</span><span class="mi">1</span><span class="p">);</span>
    <span class="p">});</span>
<span class="p">}</span>
</pre></div>

</code></pre>
<p>So now we have a command line util + module that will do our markdown to html transformations. Exciting.</p>
<p>A quick:</p>
<pre><code><div class="highlight"><pre><span class="o">&gt;</span> <span class="nx">chmod</span> <span class="nx">u</span><span class="o">+</span><span class="nx">x</span> <span class="nx">md2post</span><span class="p">.</span><span class="nx">js</span>
<span class="o">&gt;</span> <span class="p">.</span><span class="o">/</span><span class="nx">md2post</span><span class="p">.</span><span class="nx">js</span> <span class="o">--</span><span class="nx">input</span> <span class="nx">BuildingThisBlog</span><span class="p">.</span><span class="nx">md</span> <span class="o">--</span><span class="nx">output</span> <span class="nx">out</span><span class="p">.</span><span class="nx">html</span>
</pre></div>

</code></pre><p>Verifies that we indeed have some purty html (look familiar?):</p>
<pre><code class="lang-html"><div class="highlight"><pre><span class="nt">&lt;p&gt;</span>I immediately dug the instant-ness of github.io. Being pretty bare bones though
I was initially woo-ed by Jekyll. About a quarter of the way into the instructions
though, I found myself saying. You know what - you<span class="ni">&amp;#39;</span>ve done so little web stuff
in recent days. Why don<span class="ni">&amp;#39;</span>t you take a moment and build it out yourself?<span class="nt">&lt;/p&gt;</span>
</pre></div>

</code></pre>
<p>To verify that we don&#39;t break things moving forward, let&#39;s be good citizens and
write some tests. For that I like mocha, which we&#39;ll add to our deps:</p>
<pre><code><div class="highlight"><pre><span class="o">&gt;</span> <span class="nx">npm</span> <span class="nx">install</span> <span class="o">-</span><span class="nx">g</span> <span class="nx">mocha</span>
</pre></div>

</code></pre><p>For our test, we&#39;ll keep it simple and only test the transform method. To do this
though we have a physical dependency on fs, which will make things hard to test.
To inject that without having to monkey around with a proper dependency injection
pattern, we&#39;ll use rewire.</p>
<pre><code><div class="highlight"><pre><span class="o">&gt;</span> <span class="nx">npm</span> <span class="nx">install</span> <span class="nx">rewire</span> <span class="o">--</span><span class="nx">save</span><span class="o">-</span><span class="nx">dev</span>
</pre></div>

</code></pre><p>Then a really simple test. We&#39;ll grab a fragment from the marked tests, since
we&#39;re not trying to verify it&#39;s ability to parse markdown, only that our code
paths work. And then we&#39;ll write a simple test that verifies promise rejection on
file input.</p>
<pre><code class="lang-javascript"><div class="highlight"><pre><span class="kd">var</span> <span class="nx">rewire</span> <span class="o">=</span> <span class="nx">require</span><span class="p">(</span><span class="s2">&quot;rewire&quot;</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">assert</span> <span class="o">=</span> <span class="nx">require</span><span class="p">(</span><span class="s2">&quot;assert&quot;</span><span class="p">)</span>

<span class="kd">var</span> <span class="nx">Promise</span> <span class="o">=</span> <span class="nx">require</span><span class="p">(</span><span class="s2">&quot;bluebird&quot;</span><span class="p">);</span>
<span class="nx">describe</span><span class="p">(</span><span class="s1">&#39;md2post&#39;</span><span class="p">,</span> <span class="kd">function</span><span class="p">(){</span>
    <span class="nx">describe</span><span class="p">(</span><span class="s1">&#39;transforms&#39;</span><span class="p">,</span> <span class="kd">function</span><span class="p">(){</span>
        <span class="nx">it</span><span class="p">(</span><span class="s1">&#39;success write a file&#39;</span><span class="p">,</span> <span class="kd">function</span><span class="p">(</span><span class="nx">done</span><span class="p">){</span>
            <span class="kd">var</span> <span class="nx">md2post</span> <span class="o">=</span> <span class="nx">rewire</span><span class="p">(</span><span class="s2">&quot;../lib/md2post.js&quot;</span><span class="p">);</span>
            <span class="kd">var</span> <span class="nx">input</span> <span class="o">=</span> <span class="s2">&quot;inputfile.md&quot;</span><span class="p">;</span>
            <span class="kd">var</span> <span class="nx">output</span> <span class="o">=</span> <span class="s2">&quot;outputfile.md&quot;</span><span class="p">;</span>
            <span class="kd">var</span> <span class="nx">fsMock</span> <span class="o">=</span> <span class="p">{</span>
                <span class="nx">readFileAsync</span><span class="o">:</span> <span class="kd">function</span> <span class="p">(</span><span class="nx">path</span><span class="p">,</span> <span class="nx">encoding</span><span class="p">)</span> <span class="p">{</span>
                    <span class="k">return</span> <span class="k">new</span> <span class="nx">Promise</span><span class="p">(</span><span class="kd">function</span><span class="p">(</span><span class="nx">f</span><span class="p">,</span><span class="nx">r</span><span class="p">){</span>
                        <span class="nx">assert</span><span class="p">(</span><span class="nx">path</span><span class="o">===</span><span class="nx">input</span><span class="p">,</span> <span class="s2">&quot;Input path should be correct&quot;</span><span class="p">);</span>
                        <span class="nx">f</span><span class="p">(</span><span class="s2">&quot;Paragraph. &quot;</span> <span class="o">+</span>
                        <span class="s2">&quot;\n&gt; * bq Item 1 &quot;</span> <span class="o">+</span>
                        <span class="s2">&quot;\n&gt; * bq Item 2 &quot;</span> <span class="o">+</span>
                        <span class="s2">&quot;\n&gt;   * New bq Item 1 &quot;</span> <span class="o">+</span>
                        <span class="s2">&quot;\n&gt;   * New bq Item 2 &quot;</span> <span class="o">+</span>
                        <span class="s2">&quot;\n&gt;   Text here &quot;</span> <span class="o">+</span>
                        <span class="s2">&quot;\n&quot;</span> <span class="o">+</span>
                        <span class="s2">&quot;\n* * *&quot;</span><span class="p">);</span>
                    <span class="p">});</span>
                <span class="p">},</span>
                <span class="nx">writeFileAsync</span><span class="o">:</span> <span class="kd">function</span><span class="p">(</span><span class="nx">path</span><span class="p">,</span> <span class="nx">data</span><span class="p">){</span>
                    <span class="k">return</span> <span class="k">new</span> <span class="nx">Promise</span><span class="p">(</span><span class="kd">function</span><span class="p">(</span><span class="nx">f</span><span class="p">,</span><span class="nx">r</span><span class="p">){</span>
                        <span class="nx">assert</span><span class="p">(</span><span class="nx">path</span><span class="o">==</span><span class="nx">output</span><span class="p">,</span> <span class="s2">&quot;Output path should be correct&quot;</span><span class="p">);</span>
                        <span class="kd">var</span> <span class="nx">expected</span> <span class="o">=</span> <span class="s2">&quot;&lt;p&gt;Paragraph. &lt;/p&gt;\n&quot;</span> <span class="o">+</span>
                            <span class="s2">&quot;&lt;blockquote&gt;\n&quot;</span> <span class="o">+</span>
                            <span class="s2">&quot;&lt;ul&gt;\n&quot;</span> <span class="o">+</span>
                            <span class="s2">&quot;&lt;li&gt;bq Item 1 &lt;/li&gt;\n&quot;</span> <span class="o">+</span>
                            <span class="s2">&quot;&lt;li&gt;bq Item 2 &lt;ul&gt;\n&quot;</span> <span class="o">+</span>
                            <span class="s2">&quot;&lt;li&gt;New bq Item 1 &lt;/li&gt;\n&quot;</span> <span class="o">+</span>
                            <span class="s2">&quot;&lt;li&gt;New bq Item 2 \n&quot;</span> <span class="o">+</span>
                            <span class="s2">&quot;Text here &lt;/li&gt;\n&quot;</span> <span class="o">+</span>
                            <span class="s2">&quot;&lt;/ul&gt;\n&quot;</span> <span class="o">+</span>
                            <span class="s2">&quot;&lt;/li&gt;\n&quot;</span> <span class="o">+</span>
                            <span class="s2">&quot;&lt;/ul&gt;\n&quot;</span> <span class="o">+</span>
                            <span class="s2">&quot;&lt;/blockquote&gt;\n&quot;</span> <span class="o">+</span>
                            <span class="s2">&quot;&lt;hr&gt;\n&quot;</span><span class="p">;</span>

                        <span class="k">for</span><span class="p">(</span><span class="kd">var</span> <span class="nx">i</span> <span class="o">=</span><span class="mi">0</span><span class="p">;</span><span class="nx">i</span><span class="o">&lt;</span><span class="nx">expected</span><span class="p">.</span><span class="nx">length</span><span class="p">;</span><span class="nx">i</span><span class="o">++</span><span class="p">){</span>
                            <span class="k">if</span> <span class="p">(</span><span class="nx">expected</span><span class="p">[</span><span class="nx">i</span><span class="p">]</span> <span class="o">!=</span> <span class="nx">data</span><span class="p">[</span><span class="nx">i</span><span class="p">]){</span>
                                <span class="nx">console</span><span class="p">.</span><span class="nx">log</span><span class="p">(</span><span class="s2">&quot;Diff at char:&quot;</span><span class="p">,</span><span class="nx">i</span><span class="p">);</span>
                            <span class="p">}</span>
                        <span class="p">}</span>

                        <span class="nx">assert</span><span class="p">(</span><span class="nx">data</span><span class="o">===</span><span class="nx">expected</span><span class="p">,</span><span class="s2">&quot;Output should be correct&quot;</span><span class="p">);</span>
                        <span class="nx">f</span><span class="p">(</span><span class="kc">true</span><span class="p">);</span>
                        <span class="nx">done</span><span class="p">();</span>
                    <span class="p">});</span>
                <span class="p">}</span>
            <span class="p">};</span>
            <span class="nx">md2post</span><span class="p">.</span><span class="nx">__set__</span><span class="p">(</span><span class="s2">&quot;fsp&quot;</span><span class="p">,</span> <span class="nx">fsMock</span><span class="p">);</span>
            <span class="k">return</span> <span class="nx">md2post</span><span class="p">.</span><span class="nx">transform</span><span class="p">(</span><span class="nx">input</span><span class="p">,</span><span class="nx">output</span><span class="p">);</span>
        <span class="p">});</span>

        <span class="nx">it</span><span class="p">(</span><span class="s1">&#39;file failures reject properly&#39;</span><span class="p">,</span> <span class="kd">function</span><span class="p">(</span><span class="nx">done</span><span class="p">){</span>
            <span class="kd">var</span> <span class="nx">md2post</span> <span class="o">=</span> <span class="nx">require</span><span class="p">(</span><span class="s2">&quot;../lib/md2post.js&quot;</span><span class="p">);</span> <span class="c1">//no dep stub needed</span>
            <span class="nx">md2post</span><span class="p">.</span><span class="nx">transform</span><span class="p">(</span><span class="s2">&quot;fake&quot;</span><span class="p">,</span> <span class="s2">&quot;fake&quot;</span><span class="p">).</span><span class="nx">then</span><span class="p">(</span><span class="kd">function</span><span class="p">(){</span>
                <span class="nx">assert</span><span class="p">(</span><span class="kc">false</span><span class="p">);</span>
            <span class="p">}).</span><span class="nx">error</span><span class="p">(</span><span class="kd">function</span><span class="p">(</span><span class="nx">e</span><span class="p">){</span>
                <span class="nx">assert</span><span class="p">(</span><span class="kc">true</span><span class="p">);</span>
                <span class="nx">done</span><span class="p">();</span>
            <span class="p">})</span>
        <span class="p">});</span>
    <span class="p">})</span>
<span class="p">})</span>
</pre></div>

</code></pre>
<p>Okay, but now I knew I needed a way to manage posts. Some method for organizing
and indexing them. What we&#39;ll do here is follow a simple scheme of title/index.html
for post locations. Then we&#39;ll create a scheme for creating an index that we&#39;ll
use to fetch additional posts on scroll. Last we&#39;ll generate a site map and
submit it to google. After that, we&#39;ll wire up gulp command for generating
all this stuff on the fly.</p>
<p>Let&#39;s do some stuff with gulp file watchers. Now, we&#39;ll set up gulp to monitor
a posts directory for changes. When it detects one it will convert the modified
files to html and store them in a directory named for the title and index.html.</p>
<p>Doing that will give us the naming structure domain/post-title-text. Installing
gulp:</p>
<pre><code><div class="highlight"><pre><span class="nx">npm</span> <span class="nx">install</span> <span class="o">-</span><span class="nx">g</span> <span class="nx">gulp</span>
<span class="nx">npm</span> <span class="nx">install</span> <span class="nx">gulp</span> <span class="o">--</span><span class="nx">save</span><span class="o">-</span><span class="nx">dev</span>
</pre></div>

</code></pre><p>Next, we&#39;ll create a basic gulp file watch and watch our &quot;raws&quot; directory which
will contain raw mds. We&#39;ll also watch lib and test and cause modifications
there to trigger mocha. For this we&#39;ll use gulp.watch and gulp-mocha.</p>
<pre><code><div class="highlight"><pre><span class="nx">npm</span> <span class="nx">install</span> <span class="nx">gulp</span><span class="o">-</span><span class="nx">mocha</span> <span class="o">--</span><span class="nx">save</span><span class="o">-</span><span class="nx">dev</span>
</pre></div>

</code></pre><p>Our initial skeleton GulpFile.js looks like:</p>
<pre><code class="lang-javascript"><div class="highlight"><pre><span class="kd">var</span> <span class="nx">gulp</span> <span class="o">=</span> <span class="nx">require</span><span class="p">(</span><span class="s1">&#39;gulp&#39;</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">watch</span> <span class="o">=</span> <span class="nx">require</span><span class="p">(</span><span class="s1">&#39;gulp-watch&#39;</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">batch</span> <span class="o">=</span> <span class="nx">require</span><span class="p">(</span><span class="s1">&#39;gulp-batch&#39;</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">mocha</span> <span class="o">=</span> <span class="nx">require</span><span class="p">(</span><span class="s1">&#39;gulp-mocha&#39;</span><span class="p">);</span>

<span class="nx">gulp</span><span class="p">.</span><span class="nx">task</span><span class="p">(</span><span class="s1">&#39;test&#39;</span><span class="p">,</span> <span class="kd">function</span> <span class="p">()</span> <span class="p">{</span>
    <span class="nx">console</span><span class="p">.</span><span class="nx">log</span><span class="p">(</span><span class="s1">&#39;Testing!&#39;</span><span class="p">);</span>
<span class="p">});</span>

<span class="nx">gulp</span><span class="p">.</span><span class="nx">task</span><span class="p">(</span><span class="s1">&#39;build_content&#39;</span><span class="p">,</span> <span class="kd">function</span> <span class="p">()</span> <span class="p">{</span>
    <span class="nx">console</span><span class="p">.</span><span class="nx">log</span><span class="p">(</span><span class="s1">&#39;Building!&#39;</span><span class="p">);</span>
<span class="p">});</span>

<span class="nx">gulp</span><span class="p">.</span><span class="nx">task</span><span class="p">(</span><span class="s1">&#39;default&#39;</span><span class="p">,</span> <span class="kd">function</span> <span class="p">()</span> <span class="p">{</span>
    <span class="nx">watch</span><span class="p">(</span><span class="s1">&#39;lib/**/*.js&#39;</span><span class="p">,</span> <span class="nx">batch</span><span class="p">(</span><span class="kd">function</span> <span class="p">()</span> <span class="p">{</span>
        <span class="nx">gulp</span><span class="p">.</span><span class="nx">start</span><span class="p">(</span><span class="s1">&#39;test&#39;</span><span class="p">);</span>
    <span class="p">}));</span>

    <span class="nx">watch</span><span class="p">(</span><span class="s1">&#39;tests/**/*.js&#39;</span><span class="p">,</span> <span class="nx">batch</span><span class="p">(</span><span class="kd">function</span> <span class="p">()</span> <span class="p">{</span>
        <span class="nx">gulp</span><span class="p">.</span><span class="nx">start</span><span class="p">(</span><span class="s1">&#39;test&#39;</span><span class="p">);</span>
    <span class="p">}));</span>

    <span class="nx">watch</span><span class="p">(</span><span class="s1">&#39;raws/**/*.md&#39;</span><span class="p">,</span> <span class="nx">batch</span><span class="p">(</span><span class="kd">function</span> <span class="p">()</span> <span class="p">{</span>
        <span class="nx">gulp</span><span class="p">.</span><span class="nx">start</span><span class="p">(</span><span class="s1">&#39;build_content&#39;</span><span class="p">);</span>
    <span class="p">}));</span>
<span class="p">});</span>
</pre></div>

</code></pre>
<p>We can edit raws and lib to verify we see the correct console output. But,
we need some real code in there to do some real stuff. Wiring tests is easy, so
lets do that first.</p>
<pre><code class="lang-javascript"><div class="highlight"><pre><span class="kd">var</span> <span class="nx">gulp</span> <span class="o">=</span> <span class="nx">require</span><span class="p">(</span><span class="s1">&#39;gulp&#39;</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">mocha</span> <span class="o">=</span> <span class="nx">require</span><span class="p">(</span><span class="s1">&#39;gulp-mocha&#39;</span><span class="p">);</span>

<span class="nx">gulp</span><span class="p">.</span><span class="nx">task</span><span class="p">(</span><span class="s1">&#39;test&#39;</span><span class="p">,</span> <span class="kd">function</span> <span class="p">()</span> <span class="p">{</span>
    <span class="k">return</span> <span class="nx">gulp</span><span class="p">.</span><span class="nx">src</span><span class="p">(</span><span class="s1">&#39;tests/**/*.js&#39;</span><span class="p">,</span> <span class="p">{</span><span class="nx">read</span><span class="o">:</span> <span class="kc">false</span><span class="p">})</span>
        <span class="p">.</span><span class="nx">pipe</span><span class="p">(</span><span class="nx">mocha</span><span class="p">({</span><span class="nx">reporter</span><span class="o">:</span> <span class="s1">&#39;nyan&#39;</span><span class="p">}));</span>
<span class="p">});</span>

<span class="nx">gulp</span><span class="p">.</span><span class="nx">task</span><span class="p">(</span><span class="s1">&#39;build_content&#39;</span><span class="p">,</span> <span class="kd">function</span> <span class="p">()</span> <span class="p">{</span>
    <span class="nx">console</span><span class="p">.</span><span class="nx">log</span><span class="p">(</span><span class="s1">&#39;Working!&#39;</span><span class="p">);</span>
<span class="p">});</span>

<span class="nx">gulp</span><span class="p">.</span><span class="nx">task</span><span class="p">(</span><span class="s1">&#39;default&#39;</span><span class="p">,</span> <span class="kd">function</span> <span class="p">()</span> <span class="p">{</span>
    <span class="nx">watch</span><span class="p">(</span><span class="s1">&#39;lib/**/*.js&#39;</span><span class="p">,</span> <span class="nx">batch</span><span class="p">(</span><span class="kd">function</span> <span class="p">()</span> <span class="p">{</span>
        <span class="nx">gulp</span><span class="p">.</span><span class="nx">start</span><span class="p">(</span><span class="s1">&#39;test&#39;</span><span class="p">);</span>
    <span class="p">}));</span>

    <span class="nx">watch</span><span class="p">(</span><span class="s1">&#39;tests/**/*.js&#39;</span><span class="p">,</span> <span class="nx">batch</span><span class="p">(</span><span class="kd">function</span> <span class="p">()</span> <span class="p">{</span>
        <span class="nx">gulp</span><span class="p">.</span><span class="nx">start</span><span class="p">(</span><span class="s1">&#39;test&#39;</span><span class="p">);</span>
    <span class="p">}));</span>

    <span class="nx">watch</span><span class="p">(</span><span class="s1">&#39;raws/**/*.md&#39;</span><span class="p">,</span> <span class="nx">batch</span><span class="p">(</span><span class="kd">function</span> <span class="p">()</span> <span class="p">{</span>
        <span class="nx">gulp</span><span class="p">.</span><span class="nx">start</span><span class="p">(</span><span class="s1">&#39;build_content&#39;</span><span class="p">);</span>
    <span class="p">}));</span>
<span class="p">});</span>

<span class="nx">For</span> <span class="nx">building</span> <span class="nx">content</span><span class="p">,</span> <span class="nx">we</span><span class="s1">&#39;ll need another target command that will leverage</span>
<span class="s1">md2post.js. Streams hurt my head and I find them opaque but I suppose there is</span>
<span class="s1">no arguing the hard performance benefits. To get around my personal brain power</span>
<span class="s1">limitations I&#39;</span><span class="nx">m</span> <span class="nx">going</span> <span class="nx">to</span> <span class="nx">use</span> <span class="nx">through2</span> <span class="nx">which</span> <span class="nx">allows</span> <span class="nx">me</span> <span class="nx">think</span> <span class="k">in</span> <span class="nx">terms</span> <span class="nx">of</span>
<span class="nx">functional</span> <span class="nx">blocks</span> <span class="nx">but</span> <span class="nx">still</span> <span class="nx">get</span> <span class="nx">the</span> <span class="nx">benefit</span> <span class="nx">of</span> <span class="nx">streaming</span><span class="p">.</span>
</pre></div>

</code></pre>
<p>npm install through2 --save-dev
```</p>
<p>From here, I&#39;ll wire up a stream/function that will build our posts from</p>
